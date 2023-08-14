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
const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  none: { x: 0, y: 0 }
}
const carrousel = [
  directions.right,
  directions.down,
  directions.left,
  directions.up
]
const game = {
  gameSpeed: 1000 / 5, // 5 steps by second
  score: 0,
  neckColor: '',
  isIterating: false,
  currDirection: directions.none,
  sessionORT: null,
  stopLooping: false,
  lastSession: 0
  // currSession: 0
}

// Set the total number of rows and columns
const boardRows = 8 //total row number
const boardCols = 8 //total column number

//Size of each block of the snake body
const blockSize = Math.floor(
  (Math.min(window.innerHeight, window.innerWidth) * 0.94) / boardCols
)
console.log('innerHeight', window.innerHeight, 'innerWidth', window.innerWidth)
const head = new Point(0, 0)
const food = new Point(0, 0)

const snakeBody = []
const food_eated = []
const iterationPath = []

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
sliderSpeed.style.width = board.width * 0.6 + 'px'
const speedValueText = document.getElementById('speedvalue')

const biteSound = new Audio() //('./sounds/appleBite.mp3')
const slipSound = new Audio() //('./sounds/slip.mp3')
const gameOverSound = new Audio() // = new Audio('./sounds/gameOver.mp3')
const winnerSound = new Audio() // = new Audio('./sounds/winner.mp3')

window.onload = function () {
  console.log('onload')

  const hamburgerMenu = document.querySelector('.hamburger-menu')
  const menu = document.querySelector('.menu')

  hamburgerMenu.addEventListener('click', function () {
    console.log('click hamburgerMenu')
    menu.classList.toggle('active')
  })

  /**@param {HTMLSelectElement} */
  const menuExperience = document.getElementById('model_exp')
  menuExperience.addEventListener('change', function () {
    console.log('change menuExperience:', menuExperience.value)

    createSession('./models/' + menuExperience.value + '.onnx')

    menu.classList.remove('active')
  })
  menuExperience.addEventListener('click', function (ev) {
    console.log('click menuExperience')
    ev.stopPropagation()
  })

  const closeMenu = document.getElementById('close_menu')
  closeMenu.addEventListener('click', function (ev) {
    console.log('click closeMenu')
    ev.stopPropagation()
    menu.classList.remove('active')
  })

  controls.addEventListener('pointerdown', buttonMousedown)
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
      .addEventListener('pointerout', () => toogleAIassistance(switchAI, true))
  } else {
    switchAI.addEventListener('click', () =>
      toogleAIassistance(switchAI, false)
    )
  }

  sliderSpeed.addEventListener('input', changeSpeed)

  game.gameSpeed = getSpeedValue(game.gameSpeed)
  sliderSpeed.value = game.gameSpeed
  switchAI.checked = getAIAssistValue()
  drawControls()
  loadSounds()
  createSession(modelUrl)
}

/**Gets AI assist value from localStorage*/
function getAIAssistValue () {
  let AIAssistStorage = localStorage.getItem('AIAssist')
  if (AIAssistStorage == null) {
    localStorage.setItem('AIAssist', false)
    return false
  } else {
    if (AIAssistStorage == 'true') {
      return true
    } else {
      return false
    }
  }
}

/**Gets speed value from localStorage*/
function getSpeedValue (gameSpeed) {
  // localStorage.removeItem("speed")
  let gameSpeedStorage = localStorage.getItem('rangespeed')
  if (gameSpeedStorage == null) {
    localStorage.setItem('rangespeed', parseInt(1000 / gameSpeed))
  } else {
    gameSpeed = 1000 / gameSpeedStorage
  }
  return parseInt(1000 / gameSpeed)
}

function loop (time, currSession) {
  if (currSession == game.lastSession) {
    window.setTimeout(update, parseInt(time), currSession)
  }
}

/** Creates the session and load the model to inference */
async function createSession (modelUrl) {
  console.log('Creating session:', modelUrl)
  try {
    // create a new session and load the specific model.
    game.sessionORT = null
    game.sessionORT = await ort.InferenceSession.create(modelUrl)
    console.log('Session created')
    game.lastSession += 1
    reset(game.lastSession)
  } catch (e) {
    document.write(`failed to createSession ONNX: ${e}.`)
    console.log(e)
  }
}

async function loadSounds (params) {
  console.log('loading biteSound')
  const miSonidoBite = new Audio()
  // Utilizar una promesa para cargar el archivo
  await new Promise((resolve, reject) => {
    miSonidoBite.addEventListener('loadeddata', () => resolve())
    miSonidoBite.addEventListener('error', () => reject())
    miSonidoBite.src = './sounds/appleBite.mp3'
  })
  biteSound.src = miSonidoBite.src

  console.log('loading slipSound')
  const miSonidoSlip = new Audio()
  // Utilizar una promesa para cargar el archivo
  await new Promise((resolve, reject) => {
    miSonidoSlip.addEventListener('loadeddata', () => resolve())
    miSonidoSlip.addEventListener('error', () => reject())
    miSonidoSlip.src = './sounds/slip.mp3'
  })
  slipSound.src = miSonidoSlip.src

  console.log('loading gameOverSound')
  const miSonidoGOver = new Audio()
  // Utilizar una promesa para cargar el archivo
  await new Promise((resolve, reject) => {
    miSonidoGOver.addEventListener('loadeddata', () => resolve())
    miSonidoGOver.addEventListener('error', () => reject())
    miSonidoGOver.src = './sounds/gameOver.mp3'
  })
  gameOverSound.src = miSonidoGOver.src

  console.log('loading winnerSound')
  const miSonidoWin = new Audio()
  // Utilizar una promesa para cargar el archivo
  await new Promise((resolve, reject) => {
    miSonidoWin.addEventListener('loadeddata', () => resolve())
    miSonidoWin.addEventListener('error', () => reject())
    miSonidoWin.src = './sounds/winner.mp3'
  })
  winnerSound.src = miSonidoWin.src

  console.log('sounds loaded')
}

/** Resets the game to initial conditions */
function reset (currSession) {
  console.log('Reseting session:', currSession)
  game.currDirection = directions.none //starts and waits for a new direction
  // game.currDirection = directions.up //auto restart
  head.x = blockSize * (Math.floor(boardCols / 2) - 1)
  head.y = blockSize * (boardRows - 4)
  food_eated.length = 0
  iterationPath.length = 0
  game.isIterating = false
  snakeBody.length = 0
  startBody = [
    new Point([head.x, head.y]),
    new Point([head.x, head.y + blockSize * 1]),
    new Point([head.x, head.y + blockSize * 2]),
    new Point([head.x, head.y + blockSize * 3])
  ]
  snakeBody.push(...startBody)
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
  // if (currSession == game.lastSession) {
  loop(game.gameSpeed, currSession)
  // }
}

function update (currSession) {
  // console.log('    Updating; currSession:', currSession )
  if (game.currDirection.x != 0 || game.currDirection.y != 0) {
    // update eated food
    for (let n = 0; n < food_eated.length; n++) {
      food_eated[n] += 2
      if (food_eated[n] > snakeBody.length - 2) {
        food_eated.pop()
      }
    }

    head.x += game.currDirection.x * blockSize //updating Snake position in X coordinate.
    head.y += game.currDirection.y * blockSize //updating Snake position in Y coordinate.

    snakeBody.unshift(new Point(head.x, head.y)) //moves the head to the next position

    if (boardSize == snakeBody.length) {
      winner(currSession)
      return
    } else {
      if (head.x == food.x && head.y == food.y) {
        //It´s eating food
        playSound(biteSound)
        iterationPath.length = 0
        game.isIterating = false
        game.score += 1
        scoreText.innerHTML = 'Score: ' + game.score
        food_eated.unshift(-1)
        newFoodPosition()
      } else {
        snakeBody.pop() //moves the tale
        iterationPath.unshift(new Point(head.x, head.y))
        if (iterationPath.length >= snakeBody.length * 2) {
          if (
            JSON.stringify(
              iterationPath.slice(snakeBody.length, 2 * snakeBody.length)
            ) == JSON.stringify(snakeBody)
          ) {
            console.log('*************** iterating ***************')
            game.isIterating = true
          }
        }
        if (iterationPath.length >= snakeBody.length * 15) {
          gameOver(currSession)
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
      head.x < 0 ||
      head.x >= boardCols * blockSize ||
      head.y < 0 ||
      head.y >= boardRows * blockSize
    ) {
      console.log('Game Over board')
      gameOver(currSession)
      return
    }
    // Check if head is Snake eats own body
    for (let i = 1; i < snakeBody.length; i++) {
      if (head.x == snakeBody[i].x && head.y == snakeBody[i].y) {
        console.log('Game Over body')
        gameOver(currSession)
        return
      }
    }

    if (switchAI.checked && game.sessionORT != null) {
      // AI next move
      agent()
    }
  }
  loop(game.gameSpeed, currSession)
}

function gameOver (currSession) {
  playSound(gameOverSound)
  drawBoardMessage('Game Over')
  setTimeout(() => {
    reset(currSession)
  }, 3000)
}

function winner (currSession) {
  boardContext.fillStyle = boardBackColor
  boardContext.fillRect(0, 0, board.width, board.height)
  game.score += 1
  scoreText.innerHTML = 'Score: ' + game.score
  food_eated.unshift(-1)
  drawSnakeBody()
  playSound(winnerSound)

  drawBoardMessage('WINNER!')
  setTimeout(() => {
    reset(currSession)
  }, 8000)
}

/**Manual Movement of the Snake with addEventListener*/
function changeDirection (e) {
  try {
    console.log('Changing Direction')
    if (e.code == 'ArrowUp' && snakeBody[1].y != head.y - blockSize) {
      pressArrow(arrowUp)
      game.currDirection = directions.up
    } else if (e.code == 'ArrowDown' && snakeBody[1].y != head.y + blockSize) {
      pressArrow(arrowDown)
      game.currDirection = directions.down
    } else if (e.code == 'ArrowLeft' && snakeBody[1].x != head.x - blockSize) {
      pressArrow(arrowLeft)
      game.currDirection = directions.left
    } else if (e.code == 'ArrowRight' && snakeBody[1].x != head.x + blockSize) {
      pressArrow(arrowRight)
      game.currDirection = directions.right
    }
  } catch (error) {
    console.log(error.message, ' System loading!')
  }
}

function buttonMousedown (e) {
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

/**
 * Toggles the control value and saves to localstorage
 * @param {HTMLInputElement} switchControl - IA assist checkbox control
 * @param {Boolean} updateControl - updates the checkbox?
 */
function toogleAIassistance (switchControl, updateControl) {
  console.log('change swith')
  if (updateControl) {
    if (switchControl.checked) {
      switchControl.checked = false
    } else {
      switchControl.checked = true
    }
  }
  localStorage.setItem('AIAssist', switchControl.checked)
}
