import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

import clx from './../functions/clx'
import CodeRenderer from './CodeRenderer'
import styles from './../styles/chat.module.scss'

export default ({ codeBlocks }) => {
  const [activeButton, setActiveButton] = useState('')

  useEffect(() => {
    if (!codeBlocks.length) return
    setActiveButton(codeBlocks[0].language)
  }, [codeBlocks])

  return (
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
        <div className={clx(styles.tabItem, styles.preview, activeButton === 'preview' ? styles.active : styles.hidden)}>
          <CodeRenderer codeBlocks={codeBlocks} />
        </div>

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
