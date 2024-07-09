const fs = require('fs').promises
const { v4: uuidv4 } = require('uuid')
const { exec, spawn } = require('child_process')

const getCode = ({ codeBlocks }) => {
  const codeObject = {}
  for (const item of codeBlocks) {
    let language = item.language
    if (language === 'js' || language === 'javascript') {
      language = 'js'
    }

    const _language = `${language}Code`
    if (!codeObject[_language]) {
      codeObject[_language] = ''
    }
    codeObject[_language] = item.code
  }
  return codeObject
}

const createFiles = async ({ projectId, jsCode, cssCode, jsxCode, htmlCode, directoryPath }) => {
  try {
    await fs.mkdir(directoryPath, { recursive: true })

    const srcPath = `${directoryPath}/src`
    await fs.mkdir(srcPath, { recursive: true })

    const serverJsPath = `${directoryPath}/server.js`
    if (serverJsPath) await fs.writeFile(serverJsPath, jsCode)

    const jsxPath = `${directoryPath}/src/App.jsx`
    if (jsxPath) await fs.writeFile(jsxPath, jsxCode)

    const cssPath = `${directoryPath}/src/App.css`
    if (cssPath) await fs.writeFile(cssPath, cssCode)

    if (htmlCode) {
      const publicDirectoryPath = `${directoryPath}/public`
      const indexHtmlPath = `${publicDirectoryPath}/index.html`
      await fs.mkdir(publicDirectoryPath)
      await fs.writeFile(indexHtmlPath, htmlCode)
    }
  } catch (err) {
    console.error(err)
  }
}

const initNpm = async ({ bashCode, projectId, directoryPath }) => {
  const commands = [
    `cd ${directoryPath}`,
    `npm init react-app ${projectId}`,
    `cd ${projectId}`
  ]
  if (bashCode) commands.push(bashCode)
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

const spawnNode = ({ sendMessage, projectId, directoryPath, serverJsPath }) => {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('npm', ['start'], { cwd: `${directoryPath}/${projectId}` })
    let stdoutData = ''

    serverProcess.stdout.on('data', (data) => {
      stdoutData += data.toString()
      sendMessage(data.toString().replace(/\r?\n|\r/g, ' '))
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
  const { jsCode, cssCode, jsxCode, bashCode, htmlCode } = getCode({ codeBlocks })

  const directoryPath = `/tmp/chatgpt-artifacts`
  const serverJsPath = `${directoryPath}/server.js`

  // sendMessage(`Creating project directory on ${directoryPath}`)
  // await createFiles({ projectId, jsCode, cssCode, jsxCode, htmlCode, serverJsPath, directoryPath })

  if (bashCode) sendMessage(`Installing: ${bashCode}`)
  await initNpm({ bashCode, projectId, directoryPath })

  sendMessage('Running:')
  sendMessage('----------')
  await spawnNode({ sendMessage, projectId, directoryPath, serverJsPath })
}
