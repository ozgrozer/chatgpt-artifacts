import { useRef, useState } from 'react'

import clx from './../functions/clx'
import CodeBlocks from './CodeBlocks'
import styles from './../styles/Chat.module.scss'
import PromptAndResponse from './PromptAndResponse'

export default () => {
  const hasCalledBackend = useRef(false)
  const [codeBlocks, setCodeBlocks] = useState([])
  const [sandboxMode, setSandboxMode] = useState(false)
  const [streamFinished, setStreamFinished] = useState(false)
  const [codeBlocksActive, setCodeBlocksActive] = useState(false)

  return (
    <div className={clx(styles.wrapper, codeBlocksActive ? styles.codeBlocksActive : '')}>
      <PromptAndResponse
        sandboxMode={sandboxMode}
        setCodeBlocks={setCodeBlocks}
        setSandboxMode={setSandboxMode}
        codeBlocksActive={codeBlocksActive}
        hasCalledBackend={hasCalledBackend}
        setStreamFinished={setStreamFinished}
        setCodeBlocksActive={setCodeBlocksActive}
      />

      <CodeBlocks
        codeBlocks={codeBlocks}
        sandboxMode={sandboxMode}
        streamFinished={streamFinished}
        hasCalledBackend={hasCalledBackend}
      />
    </div>
  )
}
