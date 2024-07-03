import io from 'socket.io-client'
import { useRef, useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

import clx from './../functions/clx'
import CodeRenderer from './CodeRenderer'
import styles from './../styles/CodeBlocks.module.scss'

export default ({ codeBlocks, sandboxMode, streamFinished, hasCalledBackend }) => {
  const [activeButton, setActiveButton] = useState('')

  useEffect(() => {
    if (activeButton && activeButton !== 'preview') return
    if (!codeBlocks.length) return
    setActiveButton(codeBlocks[0].language)
  }, [codeBlocks])

  const [output, setOutput] = useState([])
  useEffect(() => {
    const socket = io()
    socket.on('codeBlocks', message => {
      setOutput(prevMessages => [...prevMessages, message])
    })
    return () => socket.disconnect()
  }, [])

  const socketSend = ({ codeBlocks }) => {
    const socket = io()
    socket.emit('codeBlocks', codeBlocks)
  }

  useEffect(() => {
    const complete = streamFinished &&
      codeBlocks.length > 0 &&
      codeBlocks.every(item => item.complete)
    if (complete && !hasCalledBackend.current) {
      socketSend({ codeBlocks })
      hasCalledBackend.current = true
    }
  }, [codeBlocks, streamFinished])

  return (
    <div className={clx(styles.codeBlocksWrapper, codeBlocks.length ? styles.show : '')}>
      <div className={styles.tabHeader}>
        {
          sandboxMode
            ? (
              <button
                onClick={() => setActiveButton('console')}
                className={clx(styles.tabItem, activeButton === 'console' ? styles.active : '')}
              >
                Console
              </button>
              )
            : (
              <button
                onClick={() => setActiveButton('preview')}
                className={clx(styles.tabItem, activeButton === 'preview' ? styles.active : '')}
              >
                Preview
              </button>
              )
        }

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
        {
          sandboxMode
            ? (
              <SyntaxHighlighter
                style={oneDark}
                language='bash'
                className={clx(styles.tabItem, activeButton === 'console' ? styles.active : styles.hidden)}
              >
                {output.join('\n')}
              </SyntaxHighlighter>
              )
            : (
              <div
                className={clx(
                  styles.tabItem,
                  styles.preview,
                  activeButton === 'preview' ? styles.active : styles.hidden
                )}
              >
                <CodeRenderer codeBlocks={codeBlocks} />
              </div>
              )
        }

        {codeBlocks.map((block, index) => (
          <SyntaxHighlighter
            key={index}
            style={oneDark}
            language={block.language}
            className={clx(styles.tabItem, activeButton === block.language ? styles.active : styles.hidden)}
          >
            {block.code}
          </SyntaxHighlighter>
        ))}
      </div>
    </div>
  )
}
