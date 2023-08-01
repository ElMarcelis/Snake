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
    for (let cols = 0; cols < boardRows; cols++) {
      let row = []
      for (let rows = 0; rows < boardCols; rows++) {
        row.push(0)
      }
      this.visited.push(row)
    }
  }
  setVal (row, col, value) {
    this.visited[row][col] = value
  }
  getVal (row, col) {
    return this.visited[row][col]
  }
}

/**Uses the actual state of the game enviroment
 * to inference the model
 * and computes the next move
 */
async function agent () {
  let tensorA = getState()
  // prepare feeds. use model input names as keys.
  const feeds = { input: tensorA }

  // feed inputs and run
  const results = await session.run(feeds)
  // console.log(JSON.stringify(results, null, 4));
  let next_move = [0, 0, 0]
  resutArray = Object.values(results.output.data)
  let move = resutArray.indexOf(Math.max(...resutArray))
  next_move[move] = 1
  // console.log('next_move:', next_move)

  setNewDirection(next_move)
}

/**set the direction of the snake*/
function setNewDirection (next_move) {
  let idx = carrousel.indexOf(currDirection)
  // console.log('idx:', idx)
  let new_direction = 0
  let new_idx = 0
  switch (next_move.join()) {
    case '1,0,0':
      new_direction = carrousel[idx]
      break
    case '0,1,0':
      new_idx = calcMod(idx + 1, 4)
      new_direction = carrousel[new_idx]
      break
    case '0,0,1':
      new_idx = calcMod(idx - 1, 4)
      new_direction = carrousel[new_idx]
      break
    default:
      console.log(' *************** ojo al piojo ***************')
      break
  }
  currDirection = new_direction
}

function is_collision (pnt) {
  // hits boundary
  if (pnt.x >= board.width || pnt.x < 0 || pnt.y >= board.height || pnt.y < 0) {
    return true
  }
  // hits itself
  if (isPointInArray(snakeBody.slice(0, -1), pnt)) {
    return true
  }
  return false
}

/** Gets the actual state of the enviroment */
function getState () {
  let point_l = new Point(head.x - blockSize, head.y)
  let point_r = new Point(head.x + blockSize, head.y)
  let point_u = new Point(head.x, head.y - blockSize)
  let point_d = new Point(head.x, head.y + blockSize)
  let dir_l = currDirection === directions.left
  let dir_r = currDirection === directions.right
  let dir_u = currDirection === directions.up
  let dir_d = currDirection === directions.down

  let tale_food_dist = tale_food_distance(point_l, point_r, point_u, point_d)

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
    // tale an food distance
    tale_food_dist[0], // cen
    tale_food_dist[1], // der
    tale_food_dist[2] // izq
  ]
  tensorA = new ort.Tensor('float32', state, [14])
  // console.log(JSON.stringify(tensorA))
  return tensorA
}

function tale_food_distance (point_l, point_r, point_u, point_d) {
  let emptyRoom = [0, 0, 0]
  let food_found = [0, 0, 0]
  let tale_found = [0, 0, 0]
  let tale_near = false
  let points = [point_r, point_d, point_l, point_u]
  let searchTale = -1

  if (isPointInArray(points, snakeBody.slice(-1)[0])) {
    tale_near = true
  }

  let idx_dir = carrousel.indexOf(currDirection)

  shift = new Point(currDirection.x * blockSize, currDirection.y * blockSize)

  if (
    tale_near ||
    is_collision(points[idx_dir]) ||
    (isPointInArray(
      snakeBody,
      new Point(
        points[calcMod(idx_dir + 1, 4)].x + shift.x,
        points[calcMod(idx_dir + 1, 4)].y + shift.y
      )
    ) &&
      isPointInArray(snakeBody.slice(0, -1), points[calcMod(idx_dir + 1, 4)]) ==
        false) ||
    (isPointInArray(
      snakeBody,
      new Point(
        points[calcMod(idx_dir - 1, 4)].x + shift.x,
        points[calcMod(idx_dir - 1, 4)].y + shift.y
      )
    ) &&
      isPointInArray(snakeBody.slice(0, -1), points[calcMod(idx_dir - 1, 4)]) ==
        false)
  ) {
    if (iterating) {
      searchTale = -2
    }
    while (true) {
      countBlocks(
        // straight ahead
        points[idx_dir],
        emptyRoom,
        food_found,
        tale_found,
        0,
        searchTale
      )
      countBlocks(
        // Turning right
        points[calcMod(idx_dir + 1, 4)],
        emptyRoom,
        food_found,
        tale_found,
        1,
        searchTale
      )
      countBlocks(
        // Turning left
        points[calcMod(idx_dir - 1, 4)],
        emptyRoom,
        food_found,
        tale_found,
        2,
        searchTale
      )
      if (searchTale == -1) {
        break
      } else {
        if (
          Math.max(...tale_found) == 1 &&
          food_found[tale_found.indexOf(Math.max(...tale_found))] == Infinity
        ) {
          if (Math.random() > 0.33) {
            break
          }
        }
        searchTale = -1
      }
    }
  }
  if (Math.max(...tale_found) > 0) {
    // choose the largest path to the tale
    let bestMove = [0, 0, 0]
    if (
      Math.min(...food_found) < Infinity &&
      tale_found.filter(x => x == Math.max(...tale_found)).length > 1
    ) {
      // if there are 2 options of largest path to tale, choose the shorest path to food
      bestMove = tale_found
        .map((n, i) => {
          if (n == Math.max(...tale_found)) {
            return 1
          } else {
            return 0
          }
        })
        .map((n, i) => {
          return (
            n &
            food_found.map((n, i) => {
              if (n == Math.min(...food_found)) {
                return 1
              } else {
                return 0
              }
            })[i]
          )
        })
      return bestMove
    } else {
      bestMove[tale_found.indexOf(Math.max(...tale_found))] = 1
      return bestMove
    }
  }

  return [0, 0, 0]
}

function countBlocks (
  point,
  emptyRoom,
  food_found,
  tale_found,
  idx,
  searchTale
) {
  let freeSpace = 1
  let food_dist = Infinity
  let tale_dist = 0
  let row = point.y / blockSize
  let col = point.x / blockSize
  if (JSON.stringify(snakeBody.slice(searchTale)[0]) == JSON.stringify(point)) {
    // is the tale
    // console.log('Is tale')
    emptyRoom[idx] = 1
    food_found[idx] = Infinity
    tale_found[idx] = 1
    return
  }
  if (isPointInArray(snakeBody, point)) {
    // is in body
    // console.log('Is in body')
    emptyRoom[idx] = 0
    food_found[idx] = Infinity
    tale_found[idx] = tale_dist
    return
  }
  if (is_collision(point)) {
    // console.log('            not safe\n')
    emptyRoom[idx] = 0
    food_found[idx] = Infinity
    tale_found[idx] = tale_dist
    return
  }

  let visited = new Visited_blocks()
  for (let index = 0; index < snakeBody.length; index++) {
    c = snakeBody[index].x / blockSize
    r = snakeBody[index].y / blockSize
    visited.setVal(r, c, index + 2)
  }
  if (point.x == food.x && point.y == food.y) {
    food_dist = 1
  }

  //breadth search first
  let bodyParts = [new BodyPart_distance(point, 1)]
  visited.setVal(row, col, 1)
  while (bodyParts.length > 0 && (tale_dist == 0 || food_dist == Infinity)) {
    let currBodyPart = bodyParts.shift()
    let ziparray = zip([1, 0, -1, 0], [0, 1, 0, -1])

    for (let index = 0; index < ziparray.length; index++) {
      let r = ziparray[index][1]
      let c = ziparray[index][0]
      if (
        tale_dist == 0 &&
        snakeBody.slice(searchTale)[0].x ==
          (currBodyPart.col + c) * blockSize &&
        snakeBody.slice(searchTale)[0].y == (currBodyPart.row + r) * blockSize
      ) {
        tale_dist = currBodyPart.distance
        freeSpace += 1
      }
      if (isSafe(currBodyPart.row + r, currBodyPart.col + c, visited)) {
        if (
          food_dist == Infinity &&
          food.x == (currBodyPart.col + c) * blockSize &&
          food.y == (currBodyPart.row + r) * blockSize
        ) {
          food_dist = currBodyPart.distance
        }
        visited.setVal(currBodyPart.row + r, currBodyPart.col + c, 1)
        freeSpace += 1
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
  emptyRoom[idx] = freeSpace
  food_found[idx] = food_dist
  tale_found[idx] = tale_dist
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

function isPointInArray (arr, point) {
  if (arr.findIndex(p => p.x == point.x && p.y == point.y) > -1) {
    // console.log('Is in array')
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

/**
 * @param {Array} a - Array 1
 * @param {Array} b - Array 2
 */
function zip (a, b) {
  let c = a.map(function (e, i) {
    return [e, b[i]]
  })
  return c
}
