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
  function resetArrows () {
    console.log('resetArrows')
    contextControls.strokeStyle = 'black'
    contextControls.stroke(arrowUp)
    contextControls.stroke(arrowDown)
    contextControls.stroke(arrowLeft)
    contextControls.stroke(arrowRight)
  }

  