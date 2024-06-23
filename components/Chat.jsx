import { useState, useCallback } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

import clx from './clx'
import demoResponse from './demoResponse'
import CodeRenderer from './CodeRenderer'
import styles from './../styles/chat.module.scss'
import extractCodeFromBuffer from './extractCodeFromBuffer'

export default () => {
  const [message, setMessage] = useState(demoResponse)
  const [codeBlocks, setCodeBlocks] = useState(extractCodeFromBuffer(demoResponse))
  const [prompt, setPrompt] = useState('make a todo app with html and js only')

  const [activeButton, setActiveButton] = useState(codeBlocks[0].language)

  const fetchStream = useCallback(async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let _message = ''
      setMessage('')
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        _message = _message + chunk
        setCodeBlocks(extractCodeFromBuffer(_message))
        setMessage(prevChunk => prevChunk + chunk)
      }
    } catch (error) {
      console.error('Error fetching stream:', error)
      setMessage('Error: ' + error.message)
    }
  }, [prompt])

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchStream()
  }

  return (
    <div className={clx(styles.wrapper, codeBlocks.length ? styles.codeBlocksActive : '')}>
      <div className={styles.responseWrapper}>
        <div className={styles.response}>
          {message && <pre>{message}</pre>}
        </div>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >
          <input
            type='text'
            value={prompt}
            className={styles.input}
            placeholder='Enter your prompt'
            onChange={(e) => setPrompt(e.target.value)}
          />
        </form>
      </div>

      <div className={styles.codeBlocksWrapper}>
        <div className={styles.tabHeader}>
          <button
            onClick={() => setActiveButton('preview')}
            className={clx(styles.tabItem, activeButton === 'preview' ? styles.active : '')}
          >
            Preview
          </button>

          {codeBlocks.map((block, index) => (
            <button
              key={index}
              onClick={() => setActiveButton(block.language)}
              className={clx(styles.tabItem, activeButton === block.language ? styles.active : '')}
            >
              {block.language}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          <div className={clx(styles.tabItem, activeButton === 'preview' ? styles.active : '')}>
            <CodeRenderer codeBlocks={codeBlocks} />
          </div>

          {codeBlocks.map((block, index) => (
            <SyntaxHighlighter
              key={index}
              style={oneDark}
              language={block.language}
              className={clx(styles.tabItem, activeButton === block.language ? styles.active : '')}
            >
              {block.code}
            </SyntaxHighlighter>
          ))}
        </div>
      </div>
    </div>
  )
}
