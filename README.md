gamekit
=====

[![NPM](https://nodei.co/npm/gamekit.png)](https://nodei.co/npm/gamekit/)

A little project to make a programming environment reminiscent of programming on an ASCII graphing calculator.

Useful for making games by constraining what you have to work with!

The default interface is a terminal window, but this API should be portable to other interfaces!

![example.gif](http://brycebaril.com/example.gif)

```javascript
var Game = require("gamekit")

var word = "HI"
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

```

API
===

`var game = new Gamekit(options[, updateFunction])`
---

Create a new game instance with `options` specifying `width` and `height`, and an optional `updateFunction` to be called for each animation frame of the game.

Options
  * width: required, the number of columns
  * height: required, the number of rows

When `updateFunction` is called, the `this` context is the `game`.

`game.start()`
---

Starts the animation, will call the provided `updateFunction` on each iteration of the frame main loop.

`game.stop()`
---

Stops the iteration of the fame main loop.

`game.clear()`
---

Clear the game's screen (sets all rows/columns to the character " ")

`game.output(row, column, text)`
---

Draw `text` starting at the specified `row` and `column`. If it overflows this row it will display on the next row down.

`game.getChar(row, column)`
---

Get the character on the screen at `row` and `column`

`game.capture()`
---

Capture the entire screen as one string. This saved state can then be resumed with `game.output(0, 0, capture)`

`game.bindKey(key, onPress)`
---

Bind the key `key` and call `onPress` when it is detected. The `this` context of `onPress` will be the `game`.

Examples:
```
// bind the lowecase letter "d"
game.bindKey("d", somethingCool)
// bind shift+d, i.e. an uppercase d
game.bindKey("D", somethingCool)
// bind ctrl+d, i.e. control d
game.bindKey("^d", somethingCool)
// bind the symbol "$", i.e. shift+4
game.bindKey("$", somethingCool)
// bind the enter/return key
game.bindKey("return", somethingCool)
// bind the escape/esc key
game.bindKey("escape", somethingCool)
```

Control+C is already bound to exit the game.

`game.bindKeyOnce(key, onPress)`
---

The same as `bindKey`, but will immediately unbind the key, so that the keypress is only recorded once.

`game.unbindKey(key)`
---

Remove all key bindings for `key`.

`var scheduleId = game.schedule(waitMs[, id], laterFunction)`
---

Schedule `laterFunction` to run in a later animation frame, at least `waitMs` milliseconds later. If an `id` is provided, it will automatically debounce the scheduling so only one instance of this can be scheduled at a time.

The `this` context in `laterFunction` will be the `game` object.

If no id was provided, you can use the returned `scheduleId` for unscheduling.

`game.unschedule(id)`
---

Unschedule the scheduled function with `id`.

`game.clearSchedule()`
---

Clear all scheduled functions. This is automatically called on `game.stop()`

LICENSE
=======

MIT
