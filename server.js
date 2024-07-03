const net = require('net')
const next = require('next')
const socketIo = require('socket.io')
const { createServer } = require('http')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })

const findAvailablePort = startPort => {
  return new Promise((resolve, reject) => {
    const server = net.createServer()

    server.listen(startPort, () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1).then(resolve, reject)
      } else {
        reject(err)
      }
    })
  })
}

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
