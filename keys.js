module.exports = KeyBinder

var keypress = require("keypress")

function KeyBinder(game) {
  if (!(this instanceof KeyBinder)) {
    return new KeyBinder(game)
  }

  keypress(process.stdin)

  process.stdin.setRawMode(true)
  process.stdin.resume()

  this.game = game
  this.keyBindings = keyBindings = {}
  this.onceBindings = onceBindings = {}


  process.stdin.on("keypress", function onKey(ch, key) {
    // See https://github.com/TooTallNate/keypress/issues/5
    if (key == null) {
      key = {name: ch, ctrl: false, shift: false, meta: false}
    }
    var pressed = key.name
    // decode from ch/key to pressed
    if (key.ctrl) {
      pressed = "^" + pressed
    }
    if (key.meta) {
      pressed = "#" + pressed
    }
    if (key.shift) {
      pressed = pressed.toUpperCase()
    }

    if (onceBindings[pressed]) {
      onceBindings[pressed].call(game)
      delete onceBindings[pressed]
      return
    }
    if (keyBindings[pressed]) {
      keyBindings[pressed].call(game)
      return
    }
    if (pressed == "^c") {
      process.exit()
    }
  })
}

KeyBinder.prototype._bindKey = function _bindKey(once, key, callback) {
  if (key == null || typeof key != "string" || key.length == 0) {
    throw new TypeError("key must be a key name")
  }
  if (callback == null || typeof callback != "function") {
    throw new TypeError("you must provide a function to call when the key is pressed")
  }

  if (this.keyBindings[key] || this.onceBindings[key]) {
    // already bound
    return
  }
  if (once) {
    this.onceBindings[key] = callback
  }
  else {
    this.keyBindings[key] = callback
  }
}

KeyBinder.prototype.bindKey = function bindKey(key, callback) {
  return this._bindKey(false, key, callback)
}

KeyBinder.prototype.bindKeyOnce = function bindKeyOnce(key, callback) {
  return this._bindKey(true, key, callback)
}

KeyBinder.prototype.unbindKey = function unbindKey(key) {
  if (key == null || typeof key != "string" || key.length == 0) {
    throw new TypeError("key must be a key name")
  }
  if (this.keyBindings[key]) {
    delete this.keyBindings[key]
  }
  if (this.onceBindings[key]) {
    delete this.onceBindings[key]
  }
}

KeyBinder.prototype.stop = function stop() {
  process.stdin.pause()
}
