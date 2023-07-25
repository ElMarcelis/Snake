class BodyPart_distance {
  constructor (point, distance) {
    this.row = point.y / blockSize
    this.col = point.x / blockSize
    this.distance = distance
  }
}
class Visited_blocks {
  constructor () {
    this.visited = []
    for (let cols = 0; cols < boardCols; cols++) {
      let row = []
      for (let rows = 0; rows < boardRows; rows++) {
        row.push(0)
      }
      this.visited.push(row)
    }
  }
  updateVal (r, c, value) {
    this.visited[r][c] = value
  }
  getVal (row, col) {
    return this.visited[row][col]
  }
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

  if (pointInArray(snakeBody.slice(0, -1), pnt)) {
    return true
  }
  // for (let i = 1; i < snakeBody.length - 1; i++) {
  //   if (pnt.x == snakeBody[i][0] && pnt.y == snakeBody[i][1]) {
  //     // Snake eats own body
  //     return true
  //   }
  // }
  return false
}

/** Gets the actual state of the enviroment */
function getState () {
  // Get the actual state of the enviroment
  let point_l = new Point(head.x - blockSize, head.y)
  let point_r = new Point(head.x + blockSize, head.y)
  let point_u = new Point(head.x, head.y - blockSize)
  let point_d = new Point(head.x, head.y + blockSize)
  let dir_l = currDirection === directions.left
  let dir_r = currDirection === directions.right
  let dir_u = currDirection === directions.up
  let dir_d = currDirection === directions.down

  tale_food_pos = tale_food_space(point_l, point_r, point_u, point_d)

  // tale_food_pos = [0, 0, 0]

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

  // state[11] = -state[0]
  // state[12] = -state[1]
  // state[13] = -state[2]

  tensorA = new ort.Tensor('float32', state, [14])
  // console.log(JSON.stringify(tensorA))
  return tensorA
}
function tale_food_space (point_l, point_r, point_u, point_d) {
  let cen = 0
  let der = 0
  let izq = 0
  let food_found = [0, 0, 0]
  let tale_found = [0, 0, 0]
  let tale_near = false
  let points = [point_r, point_d, point_l, point_u]

  if (pointInArray(points, snakeBody.slice(-1)[0])) {
    tale_near = true
  }

  let idx_dir = carrousel.indexOf(currDirection)

  shift = new Point(currDirection.x * blockSize, currDirection.y * blockSize)

  if (
    tale_near ||
    is_collision(points[idx_dir]) ||
    (pointInArray(
      snakeBody,
      new Point(
        points[calcMod(idx_dir + 1, 4)].x + shift.x,
        points[calcMod(idx_dir + 1, 4)].y + shift.y
      )
    ) &&
      pointInArray(snakeBody.slice(0, -1), points[calcMod(idx_dir + 1, 4)]) ==
        false) ||
    (pointInArray(
      snakeBody,
      new Point(
        points[calcMod(idx_dir - 1, 4)].x + shift.x,
        points[calcMod(idx_dir - 1, 4)].y + shift.y
      )
    ) &&
      pointInArray(snakeBody.slice(0, -1), points[calcMod(idx_dir - 1, 4)]) ==
        false)
  ) {
    result = _count_blocks(points[idx_dir])
    cen = result[0]
    food_found[0] = result[1]
    tale_found[0] = result[2]
    result = _count_blocks(points[calcMod(idx_dir + 1, 4)])
    der = result[0]
    food_found[1] = result[1]
    tale_found[1] = result[2]
    result = _count_blocks(points[calcMod(idx_dir - 1, 4)])
    izq = result[0]
    food_found[2] = result[1]
    tale_found[2] = result[2]
  }
  block_room = [cen, der, izq]
  block_room = [0, 0, 0]
  if (Math.max(...tale_found) > 0) {
    block_room[tale_found.indexOf(Math.max(...tale_found))] = 1
    return block_room
  }

  if (tale_found[0] > 0) {
    return [1, 0, 0]
  } else if (tale_found[1] > 0) {
    return [0, 1, 0]
  } else if (tale_found[2] > 0) {
    return [0, 0, 1]
  }
  return [0, 0, 0]
}
function _count_blocks (point) {
  let count = 1
  let food_found = 0
  let tale_found = 0
  let row = 0
  let col = 0
  if (pointInArray(snakeBody.slice(0, -1), point)) {
    // is in body
    console.log('Is in body')
    return [0, food_found, tale_found]
  }

  if (pointInArray(snakeBody.slice(-1), point)) {
    // is the tale
    console.log('Is tale')
    return [1, food_found, 1]
  }
  if (is_collision(point)) {
    console.log('            not safe\n')
    return [0, food_found, tale_found]
  }

  let bodyParts = [new BodyPart_distance(point, 1)]
  let visited = new Visited_blocks()
  for (let index = 0; index < snakeBody.length; index++) {
    c = snakeBody[index].x / blockSize
    r = snakeBody[index].y / blockSize
    visited.updateVal(r, c, index + 2)
  }
  if (point == food) {
    food_found = 1
  }

  row = point.y / blockSize
  col = point.x / blockSize
  visited.updateVal(row, col, 1)

  while (bodyParts.length > 0 && (tale_found == 0 || food_found == 0)) {
    let currBodyPart = bodyParts.shift()
    let ziparray = zip([1, 0, -1, 0], [0, 1, 0, -1])

    for (let index = 0; index < ziparray.length; index++) {
      let r = ziparray[index][1]
      let c = ziparray[index][0]
      if (
        tale_found == 0 &&
        snakeBody.slice(-1)[0].x == (currBodyPart.col + c) * blockSize &&
        snakeBody.slice(-1)[0].y == (currBodyPart.row + r) * blockSize
      ) {
        tale_found = currBodyPart.distance
        count += 1
      }
      if (isSafe(currBodyPart.row + r, currBodyPart.col + c, visited)) {
        if (
          food_found == 0 &&
          food.x == (currBodyPart.col + c) * blockSize &&
          food.y == (currBodyPart.row + r) * blockSize
        ) {
          food_found = currBodyPart.distance
        }
        visited.updateVal(currBodyPart.row + r, currBodyPart.col + c, 1)
        count += 1
        bodyParts.push(
          new BodyPart_distance(
            new Point(
              (currBodyPart.col + c) * blockSize,
              (currBodyPart.row + r) * blockSize
            ),
            currBodyPart.distance + 1
          )
        )
      }
    }
  }
  return [count, food_found, tale_found]
}
function isSafe (row, col, visited) {
  if (
    row >= 0 &&
    row < boardRows &&
    col >= 0 &&
    col < boardCols &&
    visited.getVal(row, col) == 0
  ) {
    return true
  } else {
    return false
  }
}
function pointInArray (arr, point) {
  if (arr.findIndex(p => p.x == point.x && p.y == point.y) > -1) {
    console.log('Is in array')
    return true
  } else {
    return false
  }
}
function calcMod (a, b) {
  result = a % b
  if (result == -1) {
    result = b - 1
  }
  return result
}
function zip (a, b) {
  var c = a.map(function (e, i) {
    return [e, b[i]]
  })
  return c
}
