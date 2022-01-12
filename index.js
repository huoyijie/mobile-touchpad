const robot = require("robotjs")
// Speed up the mouse.
robot.setMouseDelay(2)
const { width, height } = robot.getScreenSize()
console.debug('\ncomputer resolution', width, height)
var pointer = robot.getMousePos()
var pressed = false

const fs = require('fs/promises')
const Koa = require('koa')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = new Koa()
const render = require('./lib/render')
const bodyParser = require('koa-bodyparser')
const router = require('@koa/router')()
router.get('/', async ctx => {
  await ctx.render('index', {})
}).get('/hammerjs/hammer.js', async ctx => {
  ctx.set('Content-Type', 'application/javascript')
  ctx.body = await fs.readFile('./node_modules/hammerjs/hammer.min.js')
}).get('/socket.io.msgpack.min.js', async ctx => {
  ctx.set('Content-Type', 'application/javascript')
  ctx.body = await fs.readFile('./javascripts/socket.io.msgpack.min.js')
})

app.use(render)
app.use(bodyParser())
app.use(router.routes())

const parser = require("socket.io-msgpack-parser")
const httpServer = createServer(app.callback())
const io = new Server(httpServer, {
  'pingInterval': 20000,
  'pingTimeout': 30000,
  'transports': ['websocket'],
  allowUpgrades: false,
  maxHttpBufferSize: 1e8, // 100M
  parser
})
const socketSet = new Set()

io.on('connection', (socket) => {
  socketSet.add(socket)
  socket.on('panstart', () => {
    pointer = robot.getMousePos()
  }).on('panmove', (buffer) => {
    const { clientWidth, clientHeight } = socket.handshake.query
    const x = buffer.readInt16LE(0)
    const y = buffer.readInt16LE(2)
    const toX = pointer.x + Math.floor(x / clientWidth * width)
    const toY = pointer.y + Math.floor(y / clientHeight * height)
    if (pressed) {
      robot.dragMouse(toX, toY)
    } else {
      robot.moveMouse(toX, toY)
    }
  }).on('panend', () => {
    pointer = robot.getMousePos()
    if (pressed) {
      pressed = false
      robot.mouseToggle('up', 'left')
    }
  }).on('panleft', () => {
    robot.scrollMouse(1, 0)
  }).on('panright', () => {
    robot.scrollMouse(-1, 0)
  }).on('panup', () => {
    robot.scrollMouse(0, 1)
  }).on('pandown', () => {
    robot.scrollMouse(0, -1)
  }).on('tap', () => {
    robot.mouseClick('left', false)
  }).on('righttap', () => {
    robot.mouseClick('right', false)
  }).on('press', () => {
    pressed = true
    robot.mouseToggle('down', 'left')
  }).on('pressup', () => {
    pressed = false
    robot.mouseToggle('up', 'left')
  }).on("disconnect", (reason) => {
    console.debug('socket disconnect', reason)
    socketSet.delete(socket)
  })
})

httpServer.listen(3000)

function shutdown() {
  httpServer.close()
  for (let socket of socketSet) {
    socket.disconnect(true)
  }
}

process
  .on('unhandledRejection', (reason, promise) => {
    console.error(reason, 'Unhandled Rejection at Promise', promise)
  })
  .on('uncaughtException', (err, origin) => {
    console.error('Uncaught Exception thrown', err, origin, 'close the server')
    shutdown()
    process.exitCode = 1
  })
  .once('SIGINT', function (code) {
    console.warn('SIGINT received...', code, 'close the server')
    shutdown()
  })
  .once('SIGTERM', function (code) {
    console.warn('SIGTERM received...', code, 'close the server')
    shutdown()
  })