import { useState, useCallback, useRef, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

import clx from './../functions/clx'
import CodeRenderer from './CodeRenderer'
import styles from './../styles/chat.module.scss'
import extractCodeFromBuffer from './../functions/extractCodeFromBuffer'

export default () => {
  const responseRef = useRef(null)
  const [prompt, setPrompt] = useState('')
  const [message, setMessage] = useState('')
  const [codeBlocks, setCodeBlocks] = useState([])
  const [activeButton, setActiveButton] = useState('html')

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchStream()
    setPrompt('')
  }

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [message])

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
      setMessage('Error: ' + error.message)
    }
  }, [prompt])

  return (
    <div className={clx(styles.wrapper, codeBlocks.length ? styles.codeBlocksActive : '')}>
      <div className={styles.responseWrapper}>
        <div
          ref={responseRef}
          className={styles.response}
        >
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

      <div className={clx(styles.codeBlocksWrapper, codeBlocks.length ? styles.show : '')}>
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
          <div className={clx(styles.tabItem, styles.preview, activeButton === 'preview' ? styles.active : '')}>
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
