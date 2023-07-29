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
let blockSize = 100
let gameSpeed = 1000 / 5

// Set the total number of rows and columns
var boardRows = 8 //total row number
var boardCols = 8 //total column number
var boardSize = boardRows * boardCols
var boardColor = 'rgb(26 24 26)'
/** @type {HTMLCanvasElement} */
var board
/** @type {CanvasRenderingContext2D} */
var gameContext
/**  @type {box} */
let switchOnOff
let switchClass
let score = 0
let scoreBoard
/** @type {CanvasRenderingContext2D} */
var contextControls
/** @type {HTMLCanvasElement} */
var controls
let neckColor = ''
let head = new Point(0, 0)
let food = new Point(0, 0)
let food_eated = []
let directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
}
let carrousel = [
  directions.right,
  directions.down,
  directions.left,
  directions.up
]
let currDirection = { x: 0, y: 0 }
let snakeBody = []
var gameOver = false
let modelUrl = './models/model.onnx'
let session = null

let buttonLeft = new Path2D()
let buttonDown = new Path2D()
let buttonUp = new Path2D()
let buttonRight = new Path2D()

let arrowLeft = new Path2D()
let arrowDown = new Path2D()
let arrowUp = new Path2D()
let arrowRight = new Path2D()

/** @type {HTMLInputElement} */
let sliderSpeed
let speedValueText
let myInterval
let iteration = []
let iterating = false

window.onload = function () {
  // Set board height and width
  board = document.getElementById('board')
  blockSize = Math.floor(
    (Math.min(window.innerHeight, window.innerWidth) / boardRows) * 0.98
  )
  blockSize -= blockSize % boardRows
  board.height = blockSize * boardRows
  board.width = blockSize * boardCols
  console.log('board.height', board.height)
  gameContext = board.getContext('2d')
  controls = document.getElementById('controls')
  controls.height = board.height / 2
  controls.width = board.width / 2
  contextControls = controls.getContext('2d')

  controls.addEventListener('pointerdown', ButtonMousedown)
  controls.addEventListener('mouseup', resetArrows)
  controls.addEventListener('pointerleave', resetArrows)

  document.addEventListener('keydown', changeDirection) //for movements
  document.addEventListener('keyup', resetArrows)

  switchOnOff = document.getElementById('cboxSwitch')
  switchClass = document.getElementsByClassName('slider')
  //Touchscreen ?
  if ('ontouchstart' in window) {
    switchClass.item(0).addEventListener('click', function (evt) {
      evt.preventDefault()
    })
    switchClass.item(0).addEventListener('pointerout', toogleAIassistance)
  }
  scoreBoard = document.getElementById('score')
  sliderSpeed = document.getElementById('rangespeed')
  sliderSpeed.addEventListener('input', changeSpeed)
  sliderSpeed.style.width = board.width * 0.5 + "px" // "400px"

  speedValueText = document.getElementById('speedvalue')

  getSpeedValue()
  drawControls()
  createSession()
}

/**Gets speed value from localStorage*/
function getSpeedValue (params) {
  // localStorage.removeItem("speed")
  gameSpeedStorage = localStorage.getItem('rangespeed')
  if (gameSpeedStorage == null) {
    localStorage.setItem('rangespeed', parseInt(1000 / gameSpeed))
  } else {
    gameSpeed = 1000 / gameSpeedStorage
  }
  sliderSpeed.value = parseInt(1000 / gameSpeed)
}

/** Creates the session and load the model to inference */
async function createSession () {
  console.log('Creating session')
  try {
    // create a new session and load the specific model.
    session = await ort.InferenceSession.create(modelUrl)
    console.log('Session created')
    reset()
  } catch (e) {
    document.write(`failed to createSession ONNX: ${e}.`)
  }
}

/** Resets the game to initial conditions */
function reset () {
  console.log('Reseting')
  currDirection = { x: 0, y: 0 } //starts and waits for a new direction
  currDirection = directions.up //auto restart
  head.x = blockSize * (boardCols / 2 - 1)
  head.y = blockSize * (boardRows - 4)
  snakeBody = [
    new Point([head.x, head.y]),
    new Point([head.x, head.y + blockSize * 1]),
    new Point([head.x, head.y + blockSize * 2]),
    new Point([head.x, head.y + blockSize * 3])
  ]
  gameContext.fillStyle = boardColor
  gameContext.fillRect(0, 0, board.width, board.height)
  newFoodPosition()
  drawFood()
  drawSnakeBody()
  gameOver = false
  score = 0
  scoreBoard.innerHTML = 'Score: ' + score
  gameSpeed = 1000 / sliderSpeed.value
  speedValueText.innerHTML = 'Speed: ' + sliderSpeed.value
  myInterval = setInterval(update, gameSpeed)
}

function update () {
  // console.log('    Updating')
  if (currDirection.x != 0 || currDirection.y != 0) {
    if (gameOver) {
      drawWinnerText('Game Over')
      clearInterval(myInterval)
      setTimeout(() => {
        reset()
      }, 4500)
      return
    }

    // update eated food
    for (let n = 0; n < food_eated.length; n++) {
      food_eated[n] += 2
      if (food_eated[n] > snakeBody.length - 2) {
        food_eated.pop()
      }
    }

    head.x += currDirection.x * blockSize //updating Snake position in X coordinate.
    head.y += currDirection.y * blockSize //updating Snake position in Y coordinate.

    snakeBody.unshift(new Point(head.x, head.y)) //moves the head to the next position
    if (head.x == food.x && head.y == food.y) {
      //It´s eating food
      iteration = []
      iterating = false
      score += 1
      scoreBoard.innerHTML = 'Score: ' + score
      if (boardSize > snakeBody.length) {
        food_eated.unshift(-1)
        newFoodPosition()
        // drawFood()
      } else {
        drawWinnerText('WINNER!')
        clearInterval(myInterval)
        setTimeout(() => {
          reset()
        }, 4500)
        return
      }
    } else {
      snakeBody.pop() //moves the tale
      iteration.unshift(new Point(head.x, head.y))

      if (iteration.length >= snakeBody.length * 2) {
        if (
          JSON.stringify(
            iteration.slice(snakeBody.length, 2 * snakeBody.length)
          ) == JSON.stringify(snakeBody)
        ) {
          console.log('*************** iterating ***************')
          iteration = []
          iterating = true
          clearInterval(myInterval)
          reset()
        }
      }
    }
    // Background of the Game
    gameContext.fillStyle = boardColor
    gameContext.fillRect(0, 0, board.width, board.height)
    drawSnakeBody()
    drawFood()

    // Check if head is Out of bound conditionv
    if (
      head.x < 0 ||
      head.x >= boardCols * blockSize ||
      head.y < 0 ||
      head.y >= boardRows * blockSize
    ) {
      console.log('Game Over board')
      gameOver = true
      return
    }
    // Check if head is Snake eats own body
    for (let i = 1; i < snakeBody.length; i++) {
      if (head.x == snakeBody[i].x && head.y == snakeBody[i].y) {
        console.log('Game Over body')
        gameOver = true
        return
      }
    }

    if (switchOnOff.checked) {
      // AI next move
      agent()
    } else {
    }
  }
}

/**Manual Movement of the Snake whit addEventListener*/
function changeDirection (e) {
  try {
    console.log('Changing Direction')
    if (e.code == 'ArrowUp' && snakeBody[1].y != head.y - blockSize) {
      pressArrows(arrowUp)
      currDirection = directions.up
    } else if (e.code == 'ArrowDown' && snakeBody[1].y != head.y + blockSize) {
      pressArrows(arrowDown)
      currDirection = directions.down
    } else if (e.code == 'ArrowLeft' && snakeBody[1].x != head.x - blockSize) {
      pressArrows(arrowLeft)
      currDirection = directions.left
    } else if (e.code == 'ArrowRight' && snakeBody[1].x != head.x + blockSize) {
      pressArrows(arrowRight)
      currDirection = directions.right
    }
  } catch (error) {
    console.log(error.message, ' System loading!')
  }
}

function ButtonMousedown (e) {
  /** @type {CanvasRenderingContext2D} */
  var context = e.target.getContext('2d')
  var coordX =
    e.offsetX -
    parseInt(
      window.getComputedStyle(controls, null).getPropertyValue('padding-left')
    )
  var coordY =
    e.offsetY -
    parseInt(
      window.getComputedStyle(controls, null).getPropertyValue('padding-left')
    )

  var keyCode = {}

  if (
    context.isPointInPath(buttonDown, coordX, coordY) ||
    context.isPointInPath(arrowDown, coordX, coordY)
  ) {
    pressArrows(arrowDown)
    keyCode.code = 'ArrowDown'
    changeDirection(keyCode)
    return
  }
  if (
    context.isPointInPath(buttonLeft, coordX, coordY) ||
    context.isPointInPath(arrowLeft, coordX, coordY)
  ) {
    pressArrows(arrowLeft)
    keyCode.code = 'ArrowLeft'
    changeDirection(keyCode)
    return
  }
  if (
    context.isPointInPath(buttonUp, coordX, coordY) ||
    context.isPointInPath(arrowUp, coordX, coordY)
  ) {
    pressArrows(arrowUp)
    keyCode.code = 'ArrowUp'
    changeDirection(keyCode)
    return
  }
  if (
    context.isPointInPath(buttonRight, coordX, coordY) ||
    context.isPointInPath(arrowRight, coordX, coordY)
  ) {
    pressArrows(arrowRight)
    keyCode.code = 'ArrowRight'
    changeDirection(keyCode)
    return
  }
}

function changeSpeed (e) {
  gameSpeed = 1000 / e.target.value
  console.log('speed', this.value)
  clearInterval(myInterval)
  myInterval = setInterval(update, gameSpeed)
  speedValueText.innerHTML = 'Speed: ' + this.value
  localStorage.setItem('rangespeed', parseInt(e.target.value))
}

function pressArrows (arrow) {
  contextControls.strokeStyle = 'white'
  contextControls.stroke(arrow)
}

function toogleAIassistance (e) {
  console.log('change swith')
  a = document.querySelectorAll('.switch input').item(0)
  if (switchOnOff.checked) {
    switchOnOff.checked = false
  } else {
    switchOnOff.checked = true
  }
}
