import Head from 'next/head'
import { useState, useCallback } from 'react'

const extractCodeFromBuffer = (buffer) => {
  const regex = /```(?:(html|css|js|javascript)?\s*)\n([\s\S]*?)```/g
  const matches = [...buffer.matchAll(regex)]
  return matches.map(match => ({
    language: match[1] || 'javascript',
    code: match[2].trim()
  }))
}

const ChatComponent = () => {
  const [codeBlocks, setCodeBlocks] = useState([])
  const [message, setMessage] = useState('')
  const [prompt, setPrompt] = useState('make a todo app with html and js only')

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
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          value={prompt}
          placeholder='Enter your prompt'
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button type='submit'>Send</button>
      </form>

      <div>
        <h1>Chat Response:</h1>
        <pre>{message}</pre>
      </div>

      <div>
        <h1>Code Blocks:</h1>
        {codeBlocks.map((block, index) => (
          <div key={index}>
            <h2>{block.language}</h2>
            <pre>{block.code}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}

export default () => {
  return (
    <>
      <Head>
        <title>OpenAI Artifacts</title>
      </Head>
      <div>
        <ChatComponent />
      </div>
    </>
  )
}
