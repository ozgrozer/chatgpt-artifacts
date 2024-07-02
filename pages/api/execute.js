import { Readable } from 'stream'
import { promises as fs } from 'fs'
import { exec } from 'child_process'

import uuid from './../../functions/uuid'

const createJsFile = async ({ jsCode, serverJsPath, directoryPath }) => {
  try {
    await fs.mkdir(directoryPath, { recursive: true })
    await fs.writeFile(serverJsPath, jsCode)
  } catch (err) {
    console.error(err)
  }
}

const initNpm = async ({ bashCode, directoryPath }) => {
  const commands = [
    `cd ${directoryPath}`,
    'npm init -y',
    'npm pkg set type=module',
    bashCode
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
      sendMessage(data.toString())
    })
    serverProcess.stderr.on('data', data => {
      sendMessage(data.toString())
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

  const body = await new Promise(resolve => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      resolve(JSON.parse(data))
    })
  })

  let jsCode = ''
  let bashCode = ''
  for (const key in body.codeBlocks) {
    const item = body.codeBlocks[key]
    if (item.language === 'bash') {
      bashCode = item.code
    }
    if (item.language === 'js' || item.language === 'javascript') {
      jsCode = item.code
    }
  }

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

    sendMessage(`Creating project directory on ${directoryPath}`)
    await createJsFile({ jsCode, serverJsPath, directoryPath })

    sendMessage('Initializing npm')
    if (bashCode) sendMessage(`Installing npm dependencies: ${bashCode}`)
    await initNpm({ bashCode, directoryPath })

    sendMessage('Spawning node executable\n')
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
