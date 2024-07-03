const next = require('next')
const socketIo = require('socket.io')
const { createServer } = require('http')

const findAvailablePort = require('./functions/findAvailablePort')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })

app.prepare().then(() => {
  const handle = app.getRequestHandler()

  const server = createServer((req, res) => {
    handle(req, res)
  })

  const io = socketIo(server)

  io.on('connection', socket => {
    socket.on('message', message => {
      socket.broadcast.emit('message', `server: ${message}`)
    })
  })

  findAvailablePort(3000).then(port => {
    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
})
