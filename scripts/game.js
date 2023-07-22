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

  tale_food_pos = tale_food_space(point_l, point_r, point_u, point_d)
  // _count_blocks(point_l)
  // _count_blocks(point_r)
  // _count_blocks(point_u)
  // _count_blocks(point_d)
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

function tale_food_space (point_l, point_r, point_u, point_d) {
  let cen = 0
  let der = 0
  let izq = 0
  let food_found = [0, 0, 0]
  let tale_found = [0, 0, 0]
  let tale_near = false

  if (
    JSON.stringify(point_d) == JSON.stringify(snakeBody.slice(-1)[0]) ||
    JSON.stringify(point_u) == JSON.stringify(snakeBody.slice(-1)[0]) ||
    JSON.stringify(point_l) == JSON.stringify(snakeBody.slice(-1)[0]) ||
    JSON.stringify(point_r) == JSON.stringify(snakeBody.slice(-1)[0])
  ) {
    tale_near = true
  }


  idx_dir = carrousel.indexOf(currDirection)
  points = [point_r, point_d, point_l, point_u]


 if (self.direction == directions.left) {
  shift = [-blockSize, 0]
} else if (self.direction == directions.right) {
  shift = [blockSize, 0]
} else if (self.direction == directions.up) {
  shift = [0, -blockSize]
} else if (self.direction == directions.down) {
  shift = [0, blockSize]
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

function _count_blocks (point) {
  count = 1
  food_found = 0
  tale_found = 0

  if (
    snakeBody.slice(0, -2).findIndex(x => x[0] == point.x && x[1] == point.y) >
    -1
  ) {
    // is in body
    console.log('Is in body')
    return [0, food_found, tale_found]
  }
  // console.log('point', JSON.stringify(point))
  // console.log('snakeBody', JSON.stringify(snakeBody))
  // console.log([point.x, point.y].toString(), snakeBody.slice(-1)[0].toString())
  if ([point.x, point.y].toString() == snakeBody.slice(-1)[0].toString()) {
    // is the tale
    console.log('Is tale')
    return [1, food_found, 1]
  }
}

// def _count_blocks(self, point, other_count):
//       count = 1
//       food_found = 0
//       tale_found = 0
//       if point in self.snake[:-2]:
//           if self.print_comment:
//               print("            in body\n")
//           return [0, food_found, tale_found]

//       if point == self.snake[-1]:
//           if self.print_comment:
//               print("            is tale\n")
//           return [1, food_found, 1]

//       row = int(point[1] // BLOCK_SIZE)
//       col = int(point[0] // BLOCK_SIZE)
//       if not self.isSafe(row, col, point):
//           if self.print_comment:
//               print("            not safe\n")
//           return [0, food_found, tale_found]

//       Block_dist = namedtuple("BlockDist",["block", "distance"])
//       blocks = deque([Block_dist(point, 1)])
//       visited = copy.deepcopy(self.visited_blocks) # [[0 for _ in range(self.w//BLOCK_SIZE)] for _ in range(self.h//BLOCK_SIZE)]
//       for i, part in enumerate(self.snake):
//           try:
//               visited[int(part[1]//BLOCK_SIZE)][int(part[0]//BLOCK_SIZE)] = i+2
//           except:
//               pass

//       if point == self.food:
//           food_found = 1

//       visited[row][col] = 1

//       while blocks and (not tale_found or not food_found):
//           cur_block = blocks.popleft()
//           row = int(cur_block.block[1] // BLOCK_SIZE)
//           col = int(cur_block.block[0] // BLOCK_SIZE)
//           for r ,c in zip([1, 0,-1, 0],[0, 1, 0, -1]):
//               if tale_found == 0 and (self.snake[-1][0] == (col + c)*BLOCK_SIZE and self.snake[-1][1] == (row + r)*BLOCK_SIZE):
//                   tale_found = cur_block.distance
//                   count += 1
//               if self.isSafe(row + r, col + c, cur_block.block, visited):
//                   if food_found == 0 and (self.food[0] == (col + c)*BLOCK_SIZE and self.food[1] == (row + r)*BLOCK_SIZE):
//                       food_found = cur_block.distance
//                   visited[row + r][col + c] = 1
//                   count +=1
//                   blocks.append(Block_dist(((col + c)*BLOCK_SIZE, (row + r)*BLOCK_SIZE), cur_block.distance + 1))

//       if self.print_comment:
//           self.printVisited(visited)

//       return [count, food_found, tale_found]
