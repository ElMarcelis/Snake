class Point {
  constructor (x, y) {
    if (Array.isArray(x)) {
      this.x = x[0]
      this.y = x[1]
    } else {
      this.x = x
      this.y = y
    }
  }
}
const game = {
  gameSpeed: 1000 / 5, // 5 moves by second
  score: 0,
  neckColor: '',
  iterationPath: [],
  iterating: false,
  head: new Point(0, 0),
  food: new Point(0, 0),
  food_eated: [],
  currDirection: { x: 0, y: 0 },
  snakeBody: [],
  session: null
}

// Set the total number of rows and columns
const boardRows = 8 //total row number
const boardCols = 8 //total column number

//Size of each block of the snake body
const blockSize = Math.floor(
  (Math.min(window.innerHeight, window.innerWidth) * 0.94) / boardCols
)

/** @type {HTMLCanvasElement} */
const board = document.getElementById('board')
board.height = blockSize * boardRows
board.width = blockSize * boardCols
const boardSize = boardRows * boardCols
const boardBackColor = 'rgb(26 24 26)'
/** @type {CanvasRenderingContext2D} */
const boardContext = board.getContext('2d')

/**  @type {HTMLInputElement}*/
const switchAI = document.getElementById('cboxSwitch')

const switchClass = document.getElementsByClassName('slider')

/** @type {HTMLDivElement} */
const scoreText = document.getElementById('score')

/** @type {HTMLCanvasElement} */
const controls = document.getElementById('controls')
controls.height = board.width / 2
controls.width = board.width / 2
/** @type {CanvasRenderingContext2D} */
const controlsContext = controls.getContext('2d')

const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
}
const carrousel = [
  directions.right,
  directions.down,
  directions.left,
  directions.up
]

const modelUrl = './models/model.onnx'

const buttonLeft = new Path2D()
const buttonDown = new Path2D()
const buttonUp = new Path2D()
const buttonRight = new Path2D()

const arrowLeft = new Path2D()
const arrowDown = new Path2D()
const arrowUp = new Path2D()
const arrowRight = new Path2D()

/** @type {HTMLInputElement} */
const sliderSpeed = document.getElementById('rangespeed')
sliderSpeed.style.width = board.width * 0.5 + 'px'
const speedValueText = document.getElementById('speedvalue')

window.onload = function () {
  controls.addEventListener('pointerdown', ButtonMousedown)
  controls.addEventListener('mouseup', resetArrows)
  controls.addEventListener('pointerleave', resetArrows)

  document.addEventListener('keydown', changeDirection) //for movements
  document.addEventListener('keyup', resetArrows)

  //Touchscreen ?
  if ('ontouchstart' in window) {
    switchClass.item(0).addEventListener('click', function (evt) {
      evt.preventDefault()
    })
    switchClass
      .item(0)
      .addEventListener('pointerout', () => toogleAIassistance(true))
  } else {
    switchAI.addEventListener('click', () => toogleAIassistance(false))
  }

  sliderSpeed.addEventListener('input', changeSpeed)

  getSpeedValue()
  getAIAssistValue()
  drawControls()
  createSession()
}

/**Gets AI assist value from localStorage*/
function getAIAssistValue () {
  let AIAssistStorage = localStorage.getItem('AIAssist')
  if (AIAssistStorage == null) {
    localStorage.setItem('AIAssist', false)
    switchAI.checked = false
  } else {
    if (AIAssistStorage == 'true') {
      switchAI.checked = true
    } else {
      switchAI.checked = false
    }
  }
}

/**Gets speed value from localStorage*/
function getSpeedValue () {
  // localStorage.removeItem("speed")
  let gameSpeedStorage = localStorage.getItem('rangespeed')
  if (gameSpeedStorage == null) {
    localStorage.setItem('rangespeed', parseInt(1000 / game.gameSpeed))
  } else {
    game.gameSpeed = 1000 / gameSpeedStorage
  }
  sliderSpeed.value = parseInt(1000 / game.gameSpeed)
}

function loop (time) {
  window.setTimeout(update, parseInt(time))
}

/** Creates the session and load the model to inference */
async function createSession () {
  console.log('Creating session')
  try {
    // create a new session and load the specific model.
    game.session = await ort.InferenceSession.create(modelUrl)
    console.log('Session created')
    reset()
  } catch (e) {
    document.write(`failed to createSession ONNX: ${e}.`)
    console.log(e)
  }
}

/** Resets the game to initial conditions */
function reset () {
  console.log('Reseting')
  game.currDirection = { x: 0, y: 0 } //starts and waits for a new direction
  // game.currDirection = directions.up //auto restart
  game.head.x = blockSize * (Math.floor(boardCols / 2) - 1)
  game.head.y = blockSize * (boardRows - 4)
  game.food_eated = []
  game.iterationPath = []
  game.iterating = false
  game.snakeBody = [
    new Point([game.head.x, game.head.y]),
    new Point([game.head.x, game.head.y + blockSize * 1]),
    new Point([game.head.x, game.head.y + blockSize * 2]),
    new Point([game.head.x, game.head.y + blockSize * 3])
  ]
  boardContext.fillStyle = boardBackColor
  boardContext.fillRect(0, 0, board.width, board.height)
  newFoodPosition()
  drawFood()
  drawSnakeBody()
  game.score = 0
  scoreText.innerHTML = 'Score: ' + game.score
  game.gameSpeed = 1000 / sliderSpeed.value
  speedValueText.innerHTML = 'Speed: ' + sliderSpeed.value
  drawBoardMessage('Press a button to Start')
  loop(game.gameSpeed)
}

function update () {
  // console.log('    Updating')
  if (game.currDirection.x != 0 || game.currDirection.y != 0) {
    // update eated food
    for (let n = 0; n < game.food_eated.length; n++) {
      game.food_eated[n] += 2
      if (game.food_eated[n] > game.snakeBody.length - 2) {
        game.food_eated.pop()
      }
    }

    game.head.x += game.currDirection.x * blockSize //updating Snake position in X coordinate.
    game.head.y += game.currDirection.y * blockSize //updating Snake position in Y coordinate.

    game.snakeBody.unshift(new Point(game.head.x, game.head.y)) //moves the head to the next position

    if (boardSize == game.snakeBody.length) {
      winner()
      return
    } else {
      if (game.head.x == game.food.x && game.head.y == game.food.y) {
        //It´s eating food
        game.iterationPath = []
        game.iterating = false
        game.score += 1
        scoreText.innerHTML = 'Score: ' + game.score
        game.food_eated.unshift(-1)
        newFoodPosition()
      } else {
        game.snakeBody.pop() //moves the tale
        game.iterationPath.unshift(new Point(game.head.x, game.head.y))
        if (game.iterationPath.length >= game.snakeBody.length * 2) {
          if (
            JSON.stringify(
              game.iterationPath.slice(
                game.snakeBody.length,
                2 * game.snakeBody.length
              )
            ) == JSON.stringify(game.snakeBody)
          ) {
            console.log('*************** iterating ***************')
            game.iterating = true
          }
        }
        if (game.iterationPath.length >= game.snakeBody.length * 15) {
          gameOver()
          return
        }
      }
    }
    // Background of the Game
    boardContext.fillStyle = boardBackColor
    boardContext.fillRect(0, 0, board.width, board.height)
    drawSnakeBody()
    drawFood()

    // Check if head is Out of bound conditionv
    if (
      game.head.x < 0 ||
      game.head.x >= boardCols * blockSize ||
      game.head.y < 0 ||
      game.head.y >= boardRows * blockSize
    ) {
      console.log('Game Over board')
      gameOver()
      return
    }
    // Check if head is Snake eats own body
    for (let i = 1; i < game.snakeBody.length; i++) {
      if (
        game.head.x == game.snakeBody[i].x &&
        game.head.y == game.snakeBody[i].y
      ) {
        console.log('Game Over body')
        gameOver()
        return
      }
    }

    if (switchAI.checked) {
      // AI next move
      agent()
    }
  }
  loop(game.gameSpeed)
}

function gameOver () {
  drawBoardMessage('Game Over')
  setTimeout(() => {
    reset()
  }, 3000)
}

function winner () {
  boardContext.fillStyle = boardBackColor
  boardContext.fillRect(0, 0, board.width, board.height)
  game.score += 1
  scoreText.innerHTML = 'Score: ' + game.score
  game.food_eated.unshift(-1)
  drawSnakeBody()
  drawBoardMessage('WINNER!')
  setTimeout(() => {
    reset()
  }, 3000)
}

/**Manual Movement of the Snake with addEventListener*/
function changeDirection (e) {
  try {
    console.log('Changing Direction')
    if (e.code == 'ArrowUp' && game.snakeBody[1].y != game.head.y - blockSize) {
      pressArrow(arrowUp)
      game.currDirection = directions.up
    } else if (
      e.code == 'ArrowDown' &&
      game.snakeBody[1].y != game.head.y + blockSize
    ) {
      pressArrow(arrowDown)
      game.currDirection = directions.down
    } else if (
      e.code == 'ArrowLeft' &&
      game.snakeBody[1].x != game.head.x - blockSize
    ) {
      pressArrow(arrowLeft)
      game.currDirection = directions.left
    } else if (
      e.code == 'ArrowRight' &&
      game.snakeBody[1].x != game.head.x + blockSize
    ) {
      pressArrow(arrowRight)
      game.currDirection = directions.right
    }
  } catch (error) {
    console.log(error.message, ' System loading!')
  }
}

function ButtonMousedown (e) {
  /** @type {CanvasRenderingContext2D} */
  let context = e.target.getContext('2d')
  let coordX =
    e.offsetX -
    parseInt(
      window.getComputedStyle(controls, null).getPropertyValue('padding-left')
    )
  let coordY =
    e.offsetY -
    parseInt(
      window.getComputedStyle(controls, null).getPropertyValue('padding-left')
    )

  let keyCode = {}

  if (context.isPointInPath(buttonDown, coordX, coordY)) {
    pressArrow(arrowDown)
    keyCode.code = 'ArrowDown'
    changeDirection(keyCode)
    return
  }
  if (context.isPointInPath(buttonLeft, coordX, coordY)) {
    pressArrow(arrowLeft)
    keyCode.code = 'ArrowLeft'
    changeDirection(keyCode)
    return
  }
  if (context.isPointInPath(buttonUp, coordX, coordY)) {
    pressArrow(arrowUp)
    keyCode.code = 'ArrowUp'
    changeDirection(keyCode)
    return
  }
  if (context.isPointInPath(buttonRight, coordX, coordY)) {
    pressArrow(arrowRight)
    keyCode.code = 'ArrowRight'
    changeDirection(keyCode)
    return
  }
}

function changeSpeed (e) {
  game.gameSpeed = 1000 / e.target.value
  console.log('speed', this.value)
  speedValueText.innerHTML = 'Speed: ' + this.value
  localStorage.setItem('rangespeed', parseInt(e.target.value))
}

function pressArrow (arrow) {
  controlsContext.strokeStyle = 'white'
  controlsContext.stroke(arrow)
}

function toogleAIassistance (updateControl) {
  console.log('change swith')
  if (updateControl) {
    // a = document.querySelectorAll('.switch input').item(0)
    if (switchAI.checked) {
      switchAI.checked = false
    } else {
      switchAI.checked = true
    }
  }
  localStorage.setItem('AIAssist', switchAI.checked)
}
