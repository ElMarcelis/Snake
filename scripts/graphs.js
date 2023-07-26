/**Randomly place food*/
function newFoodPosition () {
  console.log('newFoodPosition')
  if (boardSize > snakeBody.length) {
    while (true) {
      food.x = Math.floor(Math.random() * boardCols) * blockSize
      food.y = Math.floor(Math.random() * boardRows) * blockSize
      if (pointInArray(snakeBody, food)) {
        // food on snake body
        console.log('new food on body')
      } else {
        break
      }
    }
  }
}

function drawFood () {
  // console.log('        Drawing food')
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

  drawReflection(food.x + blockSize / 2, food.y + blockSize / 2, blockSize / 2)

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

/**Draw light reflection on the surface*/
function drawReflection (centerX, centerY, radius) {
  context.fillStyle = 'white'
  context.beginPath()
  context.arc(
    centerX - radius / 3.5,
    centerY - radius / 3.5,
    radius / 2.5,
    0,
    2 * Math.PI
  )
  context.fill()
}

function bodyColor (variation, i) {
  color = `rgb(${255 - variation * (i + 1)} ${255 - variation * (i + 1)} 255`
  return color
}

function circColor (variation, i) {
  color = `rgb(${255 - variation * (i + 1)} ${variation * (i + 1)} ${
    255 - variation * (i + 1)
  }`
  return color
}

function drawSnakeBody () {
  // console.log('        Dwawing snake body')
  let minSize = 0.6
  let minMargin = 0.2
  let size
  let variation = 255 / snakeBody.length

  for (let i = 0; i < snakeBody.length; i++) {
    let bodyPartColor = bodyColor(variation, i)
    size = 1 - i * 0.1
    if (i > 0) {
      //body part
      context.fillStyle = bodyPartColor
      context.fillRect(snakeBody[i].x, snakeBody[i].y, blockSize, blockSize)
      //body circle
      context.fillStyle = circColor(variation, i)
      if (snakeBody.length - i <= 3) {
        // Tale
        minSize -= 0.1
        minMargin += 0.05
        context.fillStyle = 'rgb(253 83 21)'
        context.fillRect(
          snakeBody[i].x + blockSize * minMargin,
          snakeBody[i].y + blockSize * minMargin,
          blockSize * minSize,
          blockSize * minSize
        )
      } else {
        // body (not tale)
        if (food_eated.indexOf(i) >= 0) {
          //food in the belly
          size = 1
        }
        context.beginPath()
        context.arc(
          snakeBody[i].x + blockSize / 2,
          snakeBody[i].y + blockSize / 2,
          (blockSize * Math.max(size, minSize)) / 2,
          0,
          2 * Math.PI
        )
        context.fill()

        if (size == 1) {
          //food in the belly
          drawReflection(
            snakeBody[i].x + blockSize / 2,
            snakeBody[i].y + blockSize / 2,
            blockSize / 2
          )
        }
      }
    } else {
      neckColor = bodyPartColor
    }
  }
  drawSnakeHead()
}

function drawSnakeHead () {
  // console.log('        Drawing head')

  let pupilSize = 0.14
  let irisSize = 0.2
  let eyeSeparation = 0
  let neckX
  let neckY
  let neckWidth
  let neckHeight
  let eyeRX
  let eyeRY
  let eyeLX
  let eyeLY
  if (food_eated.length > 0 && food_eated[0] == -1) {
    //eating food
    pupilSize = 0.14 * 1.7
    irisSize = 0.2 * 1.5
    eyeSeparation = 0.075
  }
  switch (currDirection) {
    case directions.up:
      // coeyeLXnsole.log('            eyes up')
      eyeRX = 0.3 - eyeSeparation
      eyeRY = 0.3
      eyeLX = 0.7 + eyeSeparation
      eyeLY = 0.3
      neckX = snakeBody[0].x
      neckY = snakeBody[0].y + blockSize / 2
      neckWidth = blockSize
      neckHeight = blockSize / 2
      break
    case directions.down:
      // console.log('            eyes down')
      eyeRX = 0.7 + eyeSeparation
      eyeRY = 0.7
      eyeLX = 0.3 - eyeSeparation
      eyeLY = 0.7
      neckX = snakeBody[0].x
      neckY = snakeBody[0].y
      neckWidth = blockSize
      neckHeight = blockSize / 2
      break
    case directions.left:
      // console.log('            eyes left')
      eyeRX = 0.3
      eyeRY = 0.7 + eyeSeparation
      eyeLX = 0.3
      eyeLY = 0.3 - eyeSeparation
      neckX = snakeBody[0].x + blockSize / 2
      neckY = snakeBody[0].y
      neckWidth = blockSize / 2
      neckHeight = blockSize
      break
    case directions.right:
      // console.log('            eyes right')
      eyeRX = 0.7
      eyeRY = 0.3 - eyeSeparation
      eyeLX = 0.7
      eyeLY = 0.7 + eyeSeparation
      neckX = snakeBody[0].x
      neckY = snakeBody[0].y
      neckWidth = blockSize / 2
      neckHeight = blockSize
      break
    default:
      // console.log('            eyes default')
      eyeRX = 0.3 - eyeSeparation
      eyeRY = 0.3
      eyeLX = 0.7 + eyeSeparation
      eyeLY = 0.3
      neckX = snakeBody[0].x
      neckY = snakeBody[0].y + blockSize / 2
      neckWidth = blockSize
      neckHeight = blockSize / 2
      break
  }
  // Drawing neck
  context.fillStyle = neckColor
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

  drawEye(eyeRX, eyeRY, irisSize, pupilSize)
  drawEye(eyeLX, eyeLY, irisSize, pupilSize)
}

function drawEye (eyeX, eyeY, irisSize, pupilSize) {
  //iris
  context.fillStyle = 'rgb(247 244 22)'
  context.beginPath()
  context.arc(
    head.x + blockSize * eyeX,
    head.y + blockSize * eyeY,
    blockSize * irisSize,
    0,
    2 * Math.PI
  )
  context.fill()

  //Pupil
  context.fillStyle = 'black'
  context.beginPath()
  context.arc(
    head.x + blockSize * eyeX,
    head.y + blockSize * eyeY,
    blockSize * pupilSize,
    0,
    2 * Math.PI
  )
  context.fill()

  drawReflection(
    head.x + blockSize * eyeX,
    head.y + blockSize * eyeY,
    blockSize * irisSize
  )
}

function drawControls () {
  var centerX = controls.width / 2
  var centerY = blockSize * 2

  drawButton(buttonDown, centerX, centerY, 'rgb(244 87 87)', 45, 135)
  drawButton(buttonLeft, centerX, centerY, 'rgb(88 152 243)', 135, 225)
  drawButton(buttonUp, centerX, centerY, 'rgb(82 243 98)', 225, 315)
  drawButton(buttonRight, centerX, centerY, 'rgb(243 208 82)', 315, 45)

  contextControls.lineWidth = blockSize / 5

  drawArrow(
    arrowUp,
    centerX - blockSize * 0.7,
    centerY - blockSize,
    centerX,
    centerY - blockSize * 1.7,
    centerX + blockSize * 0.7,
    centerY - blockSize
  )
  drawArrow(
    arrowDown,
    centerX + blockSize * 0.7,
    centerY + blockSize,
    centerX,
    centerY + blockSize * 1.7,
    centerX - blockSize * 0.7,
    centerY + blockSize
  )
  drawArrow(
    arrowRight,
    centerX + blockSize,
    centerY + blockSize * 0.7,
    centerX + blockSize * 1.7,
    centerY,
    centerX + blockSize,
    centerY - blockSize * 0.7
  )
  drawArrow(
    arrowLeft,
    centerX - blockSize,
    centerY + blockSize * 0.7,
    centerX - blockSize * 1.7,
    centerY,
    centerX - blockSize,
    centerY - blockSize * 0.7
  )
}

function resetArrows () {
  console.log('resetArrows')
  contextControls.strokeStyle = 'black'
  contextControls.stroke(arrowUp)
  contextControls.stroke(arrowDown)
  contextControls.stroke(arrowLeft)
  contextControls.stroke(arrowRight)
}

function drawButton (button, centerX, centerY, color, start, end) {
  button.moveTo(centerX, centerY)
  button.arc(
    centerX,
    centerY,
    controls.width * 0.5,
    toRadians(start),
    toRadians(end)
  )
  button.lineTo(centerX, centerY)
  button.closePath()
  contextControls.fillStyle = color
  contextControls.fill(button)
}

function drawArrow (arrow, startX, startY, centerX, centerY, endX, endY) {
  arrow.moveTo(startX, startY)
  arrow.lineTo(centerX, centerY)
  arrow.lineTo(endX, endY)
  contextControls.closePath()
  contextControls.strokeStyle = 'black'
  contextControls.stroke(arrow)
}

/**Convert degrees to radians*/
function toRadians (deg) {
  return (deg * Math.PI) / 180
}
