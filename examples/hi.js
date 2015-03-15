var Game = require("../gamekit")

var word = "RUTH"
var count = 0

// A function that will move the word somewhere random on the screen
function move() {
  count++
  var row = (Math.random() * this.screen.height) >>> 0
  var col = (Math.random() * this.screen.width) >>> 0
  if (col + word.length > this.screen.width) {
    col = Math.max(this.screen.width - word.length, 0)
  }
  this.clear()
  this.output(row, col, word)
  this.schedule(500, "move", move)
}

// Our game's main loop -- which is pretty boring here
function update() {
  // Let's only do 20 "moves"
  if (count > 20) {
    // end the "game"
    this.stop()
  }
}

// Create the game box
var game = new Game({width: 21, height: 8}, update)
// start the update loop
game.start()
// schedule the first "move"
game.schedule(0, "move", move)
