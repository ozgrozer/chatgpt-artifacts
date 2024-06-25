import { useRef, useState, useEffect, useCallback } from 'react'

import styles from './../styles/chat.module.scss'
import extractCodeFromBuffer from './../functions/extractCodeFromBuffer'

export default ({ setCodeBlocks }) => {
  const responseRef = useRef(null)
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessages(prevMessages => [...prevMessages, prompt, ''])
    fetchStream(prompt, messages.length + 1)
    setPrompt('')
  }

  const fetchStream = useCallback(async (prompt, index) => {
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
        _message += chunk
        const extractedCode = extractCodeFromBuffer(_message)
        setCodeBlocks(extractedCode)

        let messageWithoutCode = _message
        extractedCode.forEach(codeBlock => {
          const codeRegex = new RegExp(`\`\`\`${codeBlock.language}?\\s*\\n([\\s\\S]*?)(\`\`\`|$)`, 'g')
          messageWithoutCode = messageWithoutCode.replace(codeRegex, (match, code, closing) => {
            return closing === '```' ? '[CODE BLOCK]' : '[CODE IS STREAMING]'
          })
        })

        setMessages(prevMessages => {
          const newMessages = [...prevMessages]
          newMessages[index] = messageWithoutCode
          return newMessages
        })
      }
    } catch (error) {
      setMessages(prevMessages => {
        const newMessages = [...prevMessages]
        newMessages[index] = `Error: ${error.message}`
        return newMessages
      })
    }
  }, [setCodeBlocks])

  return (
    <div className={styles.promptAndResponseWrapper}>
      <div
        ref={responseRef}
        className={styles.response}
      >
        {
          messages.map((msg, key) => {
            if (!msg) return null
            return <pre key={key}>{msg}</pre>
          })
        }
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
