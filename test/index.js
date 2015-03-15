var test = require("tape")

var Game = require("../gamekit")

test("init", function (t) {
  var game = new Game({width: 4, height: 4}, function update() {})
  t.ok(game instanceof Game, "constructor style")

  t.ok(typeof game.clear == "function", "has .clear")
  t.ok(typeof game.output == "function", "has .output")
  t.ok(typeof game.capture == "function", "has .capture")
  t.ok(typeof game.getChar == "function", "has .getChar")
  t.ok(typeof game.bindKey == "function", "has .bindKey")
  t.ok(typeof game.bindKeyOnce == "function", "has .bindKeyOnce")
  t.ok(typeof game.unbindKey == "function", "has .unbindKey")

  t.ok(typeof game.stop == "function", "has .stop")
  t.ok(typeof game.start == "function", "has .start")
  game.stop()
  t.end()
})

test("draw", function (t) {
  t.plan(4)
  var tested = false
  function update() {
    if (!tested) {
      t.equals(this, game, "update function this = game")
      tested = true
    }
  }
  var game = new Game({width: 5, height: 5}, update)

  game.start()
  game.output(0, 0, "A")
  game.output(1, 1, "B")

  t.equals(game.getChar(0, 0), "A", "drew an A")
  t.equals(game.getChar(1, 1), "B", "drew a B")
  game.clear()
  t.equals(game.getChar(0, 0), " ", "clear worked")
  setTimeout(function () {
    game.stop()
  }, 30)
})

test("schedules", function (t) {
  t.plan(4)
  var game = new Game({width: 10, height: 5})
  game.start()

  var now = Date.now()
  function later() {
    t.equals(this, game, "scheduled function this = game")
    t.ok(Date.now() - now >= 25, "scheduled at least 25 millis later")
  }
  game.schedule(20, "debounceme", later)
  game.schedule(25, "debounceme", later)
  var id = game.schedule(20, function () {
    t.fail("this should get unscheduled")
  })
  setImmediate(function () {
    game.unschedule(id)
  })
  game.schedule(10000, "foo", function () {
    t.fail("should be unscheduled!")
  })
  game.schedule(10000, function () {
    t.fail("should be unscheduled!")
  })
  setTimeout(function () {
    game.clearSchedule()
    t.equals(Object.keys(game.tasks).length, 0, "nothing in the task list")
    t.equals(game.taskQueue.range(0).length, 0, "nothing in the task queue")
    game.stop()
  }, 40)
})
