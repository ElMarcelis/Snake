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