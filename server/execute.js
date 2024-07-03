const fs = require('fs').promises
const { v4: uuidv4 } = require('uuid')
const { exec, spawn } = require('child_process')

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

const spawnNode = ({ sendMessage, serverJsPath }) => {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', [serverJsPath])
    let stdoutData = ''

    serverProcess.stdout.on('data', (data) => {
      stdoutData += data.toString()
      sendMessage(data.toString())
    })

    serverProcess.stderr.on('data', (data) => {
      sendMessage(data.toString())
    })

    serverProcess.on('error', reject)

    serverProcess.on('exit', (code, signal) => {
      sendMessage(`Server process exited with code ${code} and signal ${signal}`)
      resolve(stdoutData)
    })
  })
}

module.exports = async ({ codeBlocks, sendMessage }) => {
  const projectId = uuidv4()
  const { jsCode, bashCode } = getCode({ codeBlocks })

  const directoryPath = `/tmp/chatgpt-artifacts/${projectId}`
  const serverJsPath = `${directoryPath}/server.js`

  sendMessage(`Creating project directory on ${directoryPath}`)
  await createJsFile({ jsCode, serverJsPath, directoryPath })

  if (bashCode) sendMessage(`Installing npm dependencies: ${bashCode}`)
  await initNpm({ bashCode, directoryPath })

  sendMessage('Spawning node executable')
  await spawnNode({ sendMessage, serverJsPath })
}
