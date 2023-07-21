// control de celocidad con slider de 1 a 100
//on/off IA en controls canvas
//score en canvas
//mosedown muestra la flecja de direccion resaltada
//mosuse up resetea todas las flechitras

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
var context
let switchOnOff
let score = 0
let scoreBoard

/** @type {CanvasRenderingContext2D} */
var contextControls
/** @type {HTMLCanvasElement} */
var controls
let headColor = ''
let head = { x: 0, y: 0 }
let food = { x: 0, y: 0 }
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

function Point (x, y) {
  this.x = x
  this.y = y
}

var snakeBody = []
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
window.onload = function () {
  // Set board height and width
  board = document.getElementById('board')
  blockSize = Math.floor(
    (Math.min(window.innerHeight, window.innerWidth) / boardRows) * 0.98
  )
  console.log(1, blockSize)
  blockSize -= blockSize % boardRows
  console.log(2, blockSize)
  board.height = blockSize * boardRows // boardRows * blockSize
  board.width = blockSize * boardRows
  console.log('board.height', board.height)
  context = board.getContext('2d')
  controls = document.getElementById('controls')
  controls.height = 4 * blockSize
  controls.width = 4 * blockSize
  contextControls = controls.getContext('2d')
  // controls.addEventListener('mousedown', ButtonMousedown)
  controls.addEventListener('pointerdown', ButtonMousedown)
  controls.addEventListener('mouseup', resetArrows)
  controls.addEventListener('pointerleave', resetArrows)

  document.addEventListener('keyup', changeDirection) //for movements

  switchOnOff = document.getElementById('cboxSwitch')
  scoreBoard = document.getElementById('score')

  /** Creates the session and load the model to inference */
  async function createSession () {
    try {
      // create a new session and load the specific model.
      session = await ort.InferenceSession.create(modelUrl)
    } catch (e) {
      document.write(`failed to createSession ONNX: ${e}.`)
    }
  }
  drawControls()
  createSession()
  setInterval(update, gameSpeed)
  reset()
}

function _move (next_move) {
  let idx = carrousel.indexOf(currDirection)
  // console.log('idx:', idx)
  let new_dir = 0
  let new_idx = 0
  switch (next_move.join()) {
    case '1,0,0':
      // console.log('1,0,0', idx)
      new_dir = carrousel[idx]
      break
    case '0,1,0':
      new_idx = (idx + 1) % 4
      // console.log('0,1,0', new_idx)
      new_dir = carrousel[new_idx]
      break
    case '0,0,1':
      new_idx = (idx - 1) % 4
      if (idx == 0) {
        new_idx = 3
      }
      // console.log('0,0,1', new_idx)
      new_dir = carrousel[new_idx]
      break
    default:
      console.log(' *************** ojo al piojo ***************')
      break
  }
  // console.log('new_dir:', JSON.stringify(new_dir))
  currDirection = new_dir
}

function is_collision (pnt) {
  // hits boundary
  if (pnt.x >= board.width || pnt.x < 0 || pnt.y >= board.height || pnt.y < 0) {
    return true
  }
  // hits itself
  for (let i = 1; i < snakeBody.length - 1; i++) {
    if (pnt.x == snakeBody[i][0] && pnt.y == snakeBody[i][1]) {
      // Snake eats own body
      return true
    }
  }
  return false
}

/** Gets the actual state of the enviroment */
function getState () {
  // Get the actual state of the enviroment
  let point_l = new Point(head.x - blockSize, head.y)
  let point_r = new Point(head.x + blockSize, head.y)
  let point_u = new Point(head.x, head.y - blockSize)
  let point_d = new Point(head.x, head.y + blockSize)
  let dir_l = JSON.stringify(currDirection) === JSON.stringify(directions.left)
  let dir_r = JSON.stringify(currDirection) === JSON.stringify(directions.right)
  let dir_u = JSON.stringify(currDirection) === JSON.stringify(directions.up)
  let dir_d = JSON.stringify(currDirection) === JSON.stringify(directions.down)

  // tale_food_pos = tale_food_space(point_l, point_r, point_u, point_d)
  tale_food_pos = [0, 0, 0]

  let state = [
    // Danger straight
    (dir_r && is_collision(point_r)) ||
      (dir_l && is_collision(point_l)) ||
      (dir_u && is_collision(point_u)) ||
      (dir_d && is_collision(point_d)),
    // Danger right
    (dir_u && is_collision(point_r)) ||
      (dir_d && is_collision(point_l)) ||
      (dir_l && is_collision(point_u)) ||
      (dir_r && is_collision(point_d)),
    // Danger left
    (dir_d && is_collision(point_r)) ||
      (dir_u && is_collision(point_l)) ||
      (dir_r && is_collision(point_u)) ||
      (dir_l && is_collision(point_d)),

    // Move direction
    dir_l, // 3
    dir_r, // 4
    dir_u, // 5
    dir_d, // 6
    // Food location
    food.x < head.x, // food left
    food.x > head.x, // food right
    food.y < head.y, // food up
    food.y > head.y, // food down
    // tale an food position
    tale_food_pos[0], // cen
    tale_food_pos[1], // der
    tale_food_pos[2] // izq
  ]
  // return np.array(state, dtype=int)

  state[11] = -state[0]
  state[12] = -state[1]
  state[13] = -state[2]

  tensorA = new ort.Tensor('float32', state, [14])
  // console.log(JSON.stringify(tensorA))
  return tensorA
}

function tale_food_space (self, point_l, point_r, point_u, point_d) {
  cen = 0
  der = 0
  izq = 0
  food_found = [0, 0, 0]
  tale_found = [0, 0, 0]
  tale_near = False
}

async function agent () {
  let tensorA = getState()
  // prepare feeds. use model input names as keys.
  const feeds = { input: tensorA }

  // feed inputs and run
  const results = await session.run(feeds)
  // strObj = JSON.stringify(results, null, 4) // (Optional) beautiful indented output.
  // console.log(strObj); // Logs output to dev tools console.

  let next_move = [0, 0, 0]
  resutArray = Object.values(results.output.data)
  let move = resutArray.indexOf(Math.max(...resutArray))
  next_move[move] = 1
  // console.log('next_move:', next_move)

  _move(next_move)
}

/** Resets the game to de initial conditions */
function reset () {
  console.log('Reseting')
  currDirection = { x: 0, y: 0 } //auto restart
  // currDirection = directions.right
  head = { x: blockSize * 2, y: blockSize * 2 }
  snakeBody = [
    [head.x, head.y],
    [head.x, head.y + blockSize * 1],
    [head.x, head.y + blockSize * 2],
    [head.x, head.y + blockSize * 3]
  ]
  context.fillStyle = boardColor
  context.fillRect(0, 0, board.width, board.height)
  newFoodPosition()
  drawFood()
  drawSnakeBody()
  gameOver = false
  score = 0
  // scoreBoard.innerHTML = 'Score: ' + score
}

function update () {
  if (currDirection.x != 0 || currDirection.y != 0) {
    console.log('    Updating')

    if (gameOver) {
      alert('Game Over')
      reset()
      return
    }

    // Background of a Game
    context.fillStyle = boardColor
    context.fillRect(0, 0, board.width, board.height)

    // update eated food
    for (let n = 0; n < food_eated.length; n++) {
      food_eated[n] += 2
      if (food_eated[n] > snakeBody.length - 2) {
        food_eated.pop()
      }
    }

    head.x += currDirection.x * blockSize //updating Snake position in X coordinate.
    head.y += currDirection.y * blockSize //updating Snake position in Y coordinate.

    snakeBody.unshift([head.x, head.y]) //moves the head to the next position
    if (head.x == food.x && head.y == food.y) {
      //It´s eating food
      score += 1
      // scoreBoard.innerHTML = 'Score: ' + score
      if (boardSize > snakeBody.length) {
        food_eated.unshift(-1)
        newFoodPosition()
        drawFood()
      } else {
        alert('WIIIN')
        reset()
        return
      }
    } else {
      snakeBody.pop() //moves the tale
    }

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
      if (head.x == snakeBody[i][0] && head.y == snakeBody[i][1]) {
        // drawEyes()
        console.log('Game Over body')
        gameOver = true
        drawSnakeHead()
        return
      }
    }

    // if (switchOnOff.checked) {
    // Computes next move
    agent()
    // }
  }
}

/**Manual Movement of the Snake whit addEventListener*/
function changeDirection (e) {
  console.log('Changing Direction')
  if (e.code == 'ArrowUp' && snakeBody[1][1] != head.y - blockSize) {
    // If up arrow key pressed with this condition...
    // snake will not move in the opposite direction
    // console.log('changeDirection UP')
    currDirection = directions.up
  } else if (e.code == 'ArrowDown' && snakeBody[1][1] != head.y + blockSize) {
    //If down arrow key pressed
    // console.log('changeDirection DOWN')
    currDirection = directions.down
  } else if (e.code == 'ArrowLeft' && snakeBody[1][0] != head.x - blockSize) {
    //If left arrow key pressed
    // console.log('changeDirection LEFT')
    currDirection = directions.left
  } else if (e.code == 'ArrowRight' && snakeBody[1][0] != head.x + blockSize) {
    //If Right arrow key pressed
    // console.log('changeDirection RIGHT')
    currDirection = directions.right
  }
}
/**Randomly place food*/
function newFoodPosition () {
  console.log('newFoodPosition')
  if (boardSize > snakeBody.length) {
    // in x coordinates.
    food.x = Math.floor(Math.random() * boardCols) * blockSize

    //in y coordinates.
    food.y = Math.floor(Math.random() * boardRows) * blockSize

    for (let i = 0; i < snakeBody.length; i++) {
      if (food.x == snakeBody[i][0] && food.y == snakeBody[i][1]) {
        // food on snake body
        console.log('new food on body')
        newFoodPosition()
      }
    }
  }
}
function drawFood () {
  // Set food color and position
  console.log('        Drawing food')
  context.fillStyle = 'red'
  context.beginPath()
  context.arc(
    food.x + blockSize / 2,
    food.y + blockSize / 2,
    blockSize / 2,
    0,
    2 * Math.PI
  )
  context.fill()

  //light in the food
  context.fillStyle = 'white'
  context.beginPath()
  context.arc(
    food.x + blockSize / 3,
    food.y + blockSize / 3,
    blockSize / 5,
    0,
    2 * Math.PI
  )
  context.fill()
  //leaf of the food
  context.fillStyle = 'rgb(60 253 21)'
  context.beginPath()
  context.ellipse(
    food.x + blockSize / 2,
    food.y - blockSize / 6,
    blockSize / 6.5,
    blockSize / 18,
    Math.PI / 2,
    0,
    2 * Math.PI
  )
  context.fill()
}
function drawSnakeBody () {
  // console.log('        Dwawing snake body')

  let minSize = 0.6
  let minMargin = 0.2
  let size
  let margin
  variacion = 255 / snakeBody.length
  for (let i = 0; i < snakeBody.length; i++) {
    color =
      'rgb(' +
      (255 - variacion * (i + 1)) +
      ' ' +
      (255 - variacion * (i + 1)) +
      ' ' +
      255 +
      ')'
    size = 1 - i * 0.1
    margin = (1 - size) / 2
    if (i > 0) {
      context.fillStyle = color
      context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize)
      color_circ =
        'rgb(' +
        (255 - variacion * (i + 1)) +
        ' ' +
        variacion * (i + 1) +
        ' ' +
        (255 - variacion * (i + 1)) +
        ')'
      context.fillStyle = color_circ
      if (snakeBody.length - i <= 3) {
        // Tale
        minSize -= 0.1
        minMargin += 0.05
        context.fillStyle = 'rgb(253 83 21)'
        context.fillRect(
          snakeBody[i][0] + blockSize * minMargin,
          snakeBody[i][1] + blockSize * minMargin,
          blockSize * minSize,
          blockSize * minSize
        )
      } else {
        if (food_eated.indexOf(i) >= 0) {
          size = 1
        }

        context.beginPath()
        context.arc(
          snakeBody[i][0] + blockSize / 2,
          snakeBody[i][1] + blockSize / 2,
          (blockSize * Math.max(size, minSize)) / 2,
          0,
          2 * Math.PI
        )
        context.fill()

        if (size == 1) {
          //food in the belly
          context.fillStyle = 'white'
          context.beginPath()
          context.arc(
            snakeBody[i][0] + blockSize / 3,
            snakeBody[i][1] + blockSize / 3,
            blockSize / 5,
            0,
            2 * Math.PI
          )
          context.fill()
        }
      }
    } else {
      headColor = color
    }
  }
  drawSnakeHead()
}
function drawSnakeHead () {
  // console.log('        Drawing head')

  let pupilSize = 0.14
  let irisSize = 0.2
  let aa = 0
  if (food_eated.length > 0 && food_eated[0] == -1) {
    pupilSize = 0.14 * 1.7
    irisSize = 0.2 * 1.5
    aa = 0.075
  }

  let neckX
  let neckY
  let neckWidth
  let neckHeight
  let eyeRX
  let eyeRY
  let eyeLX
  let eyeLY
  let eyeCLightRX
  let eyeCLightRY
  let eyeCLightLX
  let eyeCLightLY

  direct = currDirection.x + '|' + currDirection.y
  // console.log('            direction', direct)
  switch (direct) {
    case '0|-1':
      // coeyeLXnsole.log('            eyes up')
      eyeRX = 0.3 - aa
      eyeRY = 0.3
      eyeLX = 0.7 + aa
      eyeLY = 0.3
      eyeCLightRX = 0.25 - aa * 1.4
      eyeCLightRY = 0.25 - aa * 0.9
      eyeCLightLX = 0.65 + aa * 0.9
      eyeCLightLY = 0.25 - aa * 0.9
      neckX = snakeBody[0][0]
      neckY = snakeBody[0][1] + blockSize / 2
      neckWidth = blockSize
      neckHeight = blockSize / 2
      break
    case '0|1':
      // console.log('            eyes down')
      eyeRX = 0.7 + aa
      eyeRY = 0.7
      eyeLX = 0.3 - aa
      eyeLY = 0.7
      eyeCLightRX = 0.65 + aa * 0.4
      eyeCLightRY = 0.65 - aa * 0.9
      eyeCLightLX = 0.25 - aa * 1.4
      eyeCLightLY = 0.65 - aa * 0.9
      neckX = snakeBody[0][0]
      neckY = snakeBody[0][1]
      neckWidth = blockSize
      neckHeight = blockSize / 2
      break
    case '-1|0':
      // console.log('            eyes left')
      eyeRX = 0.3
      eyeRY = 0.7 + aa
      eyeLX = 0.3
      eyeLY = 0.3 - aa
      eyeCLightRX = 0.25 - aa * 0.9
      eyeCLightRY = 0.25 - aa * 1.4
      eyeCLightLX = 0.25 - aa * 0.9
      eyeCLightLY = 0.65 + aa * 0.9
      neckX = snakeBody[0][0] + blockSize / 2
      neckY = snakeBody[0][1]
      neckWidth = blockSize / 2
      neckHeight = blockSize
      break
    case '1|0':
      // console.log('            eyes right')
      eyeRX = 0.7
      eyeRY = 0.3 - aa
      eyeLX = 0.7
      eyeLY = 0.7 + aa
      eyeCLightRX = 0.65 - aa * 0.4
      eyeCLightRY = 0.65 + aa * 0.1
      eyeCLightLX = 0.65 - aa * 0.4
      eyeCLightLY = 0.25 - aa * 1.9
      neckX = snakeBody[0][0]
      neckY = snakeBody[0][1]
      neckWidth = blockSize / 2
      neckHeight = blockSize
      break
    default:
      // console.log('            eyes default')
      eyeRX = 0.3 - aa
      eyeRY = 0.3
      eyeLX = 0.7 + aa
      eyeLY = 0.3
      eyeCLightRX = 0.25 - aa * 1.4
      eyeCLightRY = 0.25 - aa * 0.9
      eyeCLightLX = 0.65 + aa * 0.9
      eyeCLightLY = 0.25 - aa * 0.9
      neckX = snakeBody[0][0]
      neckY = snakeBody[0][1] + blockSize / 2
      neckWidth = blockSize
      neckHeight = blockSize / 2
      break
  }
  // Drawing neck
  context.fillStyle = headColor
  context.fillRect(neckX, neckY, neckWidth, neckHeight)

  // face
  context.fillStyle = 'rgb(253 83 21)'
  context.beginPath()
  context.arc(
    head.x + blockSize / 2,
    head.y + blockSize / 2,
    blockSize / 2,
    0,
    2 * Math.PI
  )
  context.fill()

  //iris right
  context.fillStyle = 'rgb(247 244 22)'
  context.beginPath()
  context.arc(
    head.x + blockSize * eyeRX,
    head.y + blockSize * eyeRY,
    blockSize * irisSize,
    0,
    2 * Math.PI
  )
  context.fill()
  //iris left
  context.beginPath()
  context.arc(
    head.x + blockSize * eyeLX,
    head.y + blockSize * eyeLY,
    blockSize * irisSize,
    0,
    2 * Math.PI
  )
  context.fill()

  //Pupil right
  context.fillStyle = 'black'
  context.beginPath()
  context.arc(
    head.x + blockSize * eyeRX,
    head.y + blockSize * eyeRY,
    blockSize * pupilSize,
    0,
    2 * Math.PI
  )
  context.fill()
  //Pupil left
  context.beginPath()
  context.arc(
    head.x + blockSize * eyeLX,
    head.y + blockSize * eyeLY,
    blockSize * pupilSize,
    0,
    2 * Math.PI
  )
  context.fill()

  //CatchLight right
  context.fillStyle = 'white'
  context.beginPath()
  context.arc(
    head.x + blockSize * eyeCLightRX,
    head.y + blockSize * eyeCLightRY,
    blockSize * irisSize * 0.43,
    0,
    2 * Math.PI
  )
  context.fill()

  //CatchLight left
  context.beginPath()
  context.arc(
    head.x + blockSize * eyeCLightLX,
    head.y + blockSize * eyeCLightLY,
    blockSize * irisSize * 0.43,
    0,
    2 * Math.PI
  )
  context.fill()
}
function drawControls () {
  var cx = controls.width / 2
  var cy = blockSize * 2

  // in case you like using degrees
  function toRadians (deg) {
    return (deg * Math.PI) / 180
  }

  // buttonUP.beginPath()
  buttonDown.moveTo(cx, cy)
  buttonDown.arc(cx, cy, controls.width * 0.5, toRadians(45), toRadians(135))
  buttonDown.lineTo(cx, cy)
  buttonDown.closePath()
  contextControls.fillStyle = 'rgb(244 87 87)'
  contextControls.fill(buttonDown)

  buttonLeft.moveTo(cx, cy)
  buttonLeft.arc(cx, cy, controls.width * 0.5, toRadians(135), toRadians(225))
  buttonLeft.lineTo(cx, cy)
  buttonLeft.closePath()
  contextControls.fillStyle = 'rgb(88 152 243)'
  contextControls.fill(buttonLeft)

  buttonUp.moveTo(cx, cy)
  buttonUp.arc(cx, cy, controls.width * 0.5, toRadians(225), toRadians(315))
  buttonUp.lineTo(cx, cy)
  buttonUp.closePath()
  contextControls.fillStyle = 'rgb(82 243 98)'
  contextControls.fill(buttonUp)

  buttonRight.moveTo(cx, cy)
  buttonRight.arc(cx, cy, controls.width * 0.5, toRadians(315), toRadians(45))
  buttonRight.lineTo(cx, cy)
  contextControls.closePath()
  contextControls.fillStyle = 'rgb(243 208 82)'
  contextControls.fill(buttonRight)

  contextControls.lineWidth = blockSize / 5

  arrowUp.moveTo(cx - blockSize * 0.7, cy - blockSize)
  arrowUp.lineTo(cx, cy - blockSize * 1.7)
  arrowUp.lineTo(cx + blockSize * 0.7, cy - blockSize)
  contextControls.closePath()
  contextControls.strokeStyle = 'black'
  contextControls.stroke(arrowUp)

  arrowDown.moveTo(cx + blockSize * 0.7, cy + blockSize)
  arrowDown.lineTo(cx, cy + blockSize * 1.7)
  arrowDown.lineTo(cx - blockSize * 0.7, cy + blockSize)
  contextControls.closePath()
  contextControls.strokeStyle = 'black'
  contextControls.stroke(arrowDown)

  arrowRight.moveTo(cx + blockSize, cy + blockSize * 0.7)
  arrowRight.lineTo(cx + blockSize * 1.7, cy)
  arrowRight.lineTo(cx + blockSize, cy - blockSize * 0.7)
  contextControls.closePath()
  contextControls.strokeStyle = 'black'
  contextControls.stroke(arrowRight)

  arrowLeft.moveTo(cx - blockSize, cy + blockSize * 0.7)
  arrowLeft.lineTo(cx - blockSize * 1.7, cy)
  arrowLeft.lineTo(cx - blockSize, cy - blockSize * 0.7)
  contextControls.closePath()
  contextControls.strokeStyle = 'black'
  contextControls.stroke(arrowLeft)
  // arrowLeft.moveTo(cx, cy)
  // arrowDown.moveTo(cx, cy)

  // arrowRight.moveTo(cx, cy)
}
function ButtonMousedown (e) {
  /** @type {CanvasRenderingContext2D} */
  var context = e.target.getContext('2d')
  console.log(
    'padding',
    parseInt(
      window.getComputedStyle(controls, null).getPropertyValue('padding-left')
    )
  )
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
  // var coordX = e.offsetleft
  // var coordY = e.offsetTop

  var e

  if (
    context.isPointInPath(buttonDown, coordX, coordY) ||
    context.isPointInPath(arrowDown, coordX, coordY)
  ) {
    console.log('buttonDown')
    contextControls.strokeStyle = 'white'
    contextControls.stroke(arrowDown)
    e.code = 'ArrowDown'
    changeDirection(e)
    return
  }
  if (
    context.isPointInPath(buttonLeft, coordX, coordY) ||
    context.isPointInPath(arrowLeft, coordX, coordY)
  ) {
    console.log('buttonLeft')
    contextControls.strokeStyle = 'white'
    contextControls.stroke(arrowLeft)
    e.code = 'ArrowLeft'
    changeDirection(e)
    return
  }
  if (
    context.isPointInPath(buttonUp, coordX, coordY) ||
    context.isPointInPath(arrowUp, coordX, coordY)
  ) {
    console.log('buttonUp')
    contextControls.strokeStyle = 'white'
    contextControls.stroke(arrowUp)
    e.code = 'ArrowUp'
    changeDirection(e)
    return
  }
  if (
    context.isPointInPath(buttonRight, coordX, coordY) ||
    context.isPointInPath(arrowRight, coordX, coordY)
  ) {
    console.log('buttonRight')
    contextControls.strokeStyle = 'white'
    contextControls.stroke(arrowRight)
    e.code = 'ArrowRight'
    changeDirection(e)
    return
  }
}

function resetArrows () {
  console.log('resetArrows')
  contextControls.strokeStyle = 'black'
  contextControls.stroke(arrowUp)
  contextControls.stroke(arrowDown)
  contextControls.stroke(arrowLeft)
  contextControls.stroke(arrowRight)
}
