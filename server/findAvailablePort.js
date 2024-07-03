const net = require('net')

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

module.exports = findAvailablePort
