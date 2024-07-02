import { Readable } from 'stream'
import { promises as fs } from 'fs'
import { exec } from 'child_process'

import uuid from './../../functions/uuid'

const content = `
const http = require('http')
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Hello World')
})
server.listen(3001, () => {
  console.log('Server running at http://localhost:3001')
})
`

const npmInstallCommand = 'npm install uuid'

const createJsFile = async ({ content, serverJsPath, directoryPath }) => {
  try {
    await fs.mkdir(directoryPath, { recursive: true })
    await fs.writeFile(serverJsPath, content)
  } catch (err) {
    console.error(err)
  }
}

const initNpm = async ({ directoryPath, npmInstallCommand }) => {
  const commands = [
    `cd ${directoryPath}`,
    'npm init -y',
    npmInstallCommand
  ]
  return new Promise((resolve, reject) => {
    exec(commands.join(' && '), (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        reject(err)
        return
      }
      if (stdout) console.log(stdout)
      if (stderr) console.error(stderr)
      resolve()
    })
  })
}

const spawnNode = ({ sendMessage, serverJsPath }) => {
  const { spawn } = require('child_process')
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', [serverJsPath])
    serverProcess.stdout.on('data', data => {
      sendMessage(`Server: ${data}`)
    })
    serverProcess.stderr.on('data', data => {
      sendMessage(`Server: ${data}`)
    })
    serverProcess.on('error', reject)
    serverProcess.on('exit', (code, signal) => {
      sendMessage(`Server process exited with code ${code} and signal ${signal}`)
      resolve()
    })
  })
}

export default async (req, res) => {
  const projectId = uuid()

  res.writeHead(200, {
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream'
  })

  const stream = new Readable({
    read () {}
  })

  stream.pipe(res)

  const sendMessage = message => stream.push(`${message}\n`)

  try {
    const directoryPath = `/tmp/chatgpt-artifacts/${projectId}`
    const serverJsPath = `${directoryPath}/server.js`

    sendMessage('Creating directory and file...')
    await createJsFile({ content, serverJsPath, directoryPath })

    sendMessage('Initializing npm and installing dependencies...')
    await initNpm({ directoryPath, npmInstallCommand })

    sendMessage('Starting Node.js server...')
    await spawnNode({ sendMessage, serverJsPath })
  } catch (err) {
    sendMessage(`Error: ${err.message}`)
  } finally {
    stream.push(null)
  }
}

export const config = {
  api: {
    bodyParser: false
  }
}
