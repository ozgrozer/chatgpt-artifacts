import { promises as fs } from 'fs'
import { exec, spawn } from 'child_process'

import uuid from './../../functions/uuid'

const getCode = ({ codeBlocks }) => {
  let jsCode = ''
  let bashCode = ''
  for (const key in codeBlocks) {
    const item = codeBlocks[key]
    if (item.language === 'bash') {
      bashCode = item.code
    }
    if (item.language === 'js' || item.language === 'javascript') {
      jsCode = item.code
    }
  }

  return { jsCode, bashCode }
}

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
      // if (stdout) console.log(stdout)
      if (stderr) console.error(stderr)
      resolve()
    })
  })
}

const spawnNode = ({ serverJsPath }) => {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', [serverJsPath])
    let stdoutData = ''

    serverProcess.stdout.on('data', (data) => {
      stdoutData += data.toString()
      console.log(data.toString())
    })

    serverProcess.stderr.on('data', (data) => {
      console.log(data.toString())
    })

    serverProcess.on('error', reject)

    serverProcess.on('exit', (code, signal) => {
      console.log(
        `Server process exited with code ${code} and signal ${signal}`
      )
      resolve(stdoutData)
    })
  })
}

const generateStream = async ({ jsCode, bashCode, serverJsPath, directoryPath }) => {
  const steps = [
    async () => {
      await createJsFile({ jsCode, serverJsPath, directoryPath })
      return `Project directory created on ${directoryPath}`
    },
    async () => {
      await initNpm({ bashCode, directoryPath })
      return 'NPM initialized'
    },
    async () => {
      const res = await spawnNode({ serverJsPath })
      return `Node.js process output:\n${res}`
    }
  ]

  const results = []
  for (const step of steps) {
    const result = await step()
    results.push(result)
  }

  return results
}

export default async (req, res) => {
  const projectId = uuid()

  const { codeBlocks } = req.body
  const { jsCode, bashCode } = getCode({ codeBlocks })

  const directoryPath = `/tmp/chatgpt-artifacts/${projectId}`
  const serverJsPath = `${directoryPath}/server.js`

  const stream = await generateStream({ jsCode, serverJsPath, directoryPath, bashCode })

  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Content-Type', 'text/event-stream')
  res.flushHeaders()

  for (const chunkPromise of stream) {
    try {
      const chunk = await chunkPromise
      res.write(chunk + '\n')
    } catch (error) {
      console.error('Error in stream processing:', error)
      res.write(`Error: ${error.message}\n`)
    }
  }

  res.end()
}

export const config = {
  runtime: 'nodejs'
}
