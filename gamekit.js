module.exports = Gamekit

var Screen = require("gamekit-screen-cli")
var KeyBinder = require("./keys")
var raf = require("raf")
var xtend = require("xtend")
var SortedMap = require("sorted-map")
var crypto = require("crypto")

function Gamekit(options, update) {
  if (!(this instanceof Gamekit)) {
    return new Gamekit(options, update)
  }

  options = xtend({screen: Screen, keys: KeyBinder}, options)
  if (update == null) {
    update = function noop() {}
  }

  this.screen = new options.screen(options)
  this.keys = new options.keys(this)
  this.update = update
  this.running = false
  this.rafHandle = null
  this.tasks = {}
  this.taskQueue = new SortedMap()
}

Gamekit.prototype.start = function start() {
  if (this.running) {
    return
  }
  var self = this
  this.running = true
  var runloop = function run() {
    if (self.running) {
      var tasks = self.taskQueue.range(0, Date.now())
      for (var i = 0; i < tasks.length; i++) {
        var jobId = tasks[i].key
        var fn = self.tasks[jobId]
        delete self.tasks[jobId]
        self.taskQueue.del(jobId)
        fn.call(self)
      }
      self.update.call(self)
      self.screen.paint()
      self.rafHandle = raf(runloop)
    }
  }
  runloop()
}

Gamekit.prototype.stop = function stop() {
  this.running = false
  raf.cancel(this.rafHandle)
  this.clearSchedule()
  this.screen.cleanup()
  this.keys.stop()
}

Gamekit.prototype.clear = function clear() {
  return this.screen.clear()
}
Gamekit.prototype.output = function output(row, column, text) {
  return this.screen.output(row, column, text)
}
Gamekit.prototype.getChar = function getChar(row, column) {
  return this.screen.getChar(row, column)
}
Gamekit.prototype.capture = function capture() {
  return this.screen.capture()
}
Gamekit.prototype.bindKey = function bindKey(key, callback) {
  return this.keys.bindKey(key, callback)
}
Gamekit.prototype.bindKeyOnce = function bindKeyOnce(key, callback) {
  return this.keys.bindKeyOnce(key, callback)
}
Gamekit.prototype.unbindKey = function unbindKey(key, callback) {
  return this.keys.unbindKey(key, callback)
}
Gamekit.prototype.schedule = function schedule(delayMs, id, task) {
  // debouncing timer
  if (task == null) {
    if (typeof id == "function") {
      task = id
      id = crypto.randomBytes(5).toString('hex')
    }
    else {
      throw new Error("schedule expects a delay in ms, an optional id, and a task function")
    }
  }
  if (delayMs >>> 0 != delayMs) {
    throw new Error("delay must be a whole number of milliseconds")
  }
  this.taskQueue.set(id, Date.now() + delayMs)
  this.tasks[id] = task
  return id
}
Gamekit.prototype.unschedule = function unschedule(jobId) {
  delete this.tasks[jobId]
  this.taskQueue.del(jobId)
}
Gamekit.prototype.clearSchedule = function clearSchedule() {
  var tasks = this.taskQueue.range(0)
  for (var i = 0; i < tasks.length; i++) {
    var jobId = tasks[i].key
    delete this.tasks[jobId]
    this.taskQueue.del(jobId)
  }
}
