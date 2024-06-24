import { useRef, useState, useEffect, useCallback } from 'react'

import styles from './../styles/chat.module.scss'
import extractCodeFromBuffer from './../functions/extractCodeFromBuffer'

export default ({ setCodeBlocks }) => {
  const responseRef = useRef(null)
  const [prompt, setPrompt] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [message])

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchStream()
    setMessage(`${prompt}\n`)
    setPrompt('')
  }

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
    <div className={styles.promptAndResponseWrapper}>
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
  )
}
