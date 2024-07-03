const next = require('next')
const socketIo = require('socket.io')
const { createServer } = require('http')

const execute = require('./execute')
const findAvailablePort = require('./findAvailablePort')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    if (req.url === '/') {
      return app.render(req, res, '/', req.query)
    }

    return handle(req, res)
  })

  const io = socketIo(server)

  io.on('connection', socket => {
    socket.on('codeBlocks', codeBlocks => {
      execute({ socket, codeBlocks })
    })
  })

  findAvailablePort(3000).then(port => {
    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
})
