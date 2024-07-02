import { useState } from 'react'

import clx from './../functions/clx'
import CodeBlocks from './CodeBlocks'
import styles from './../styles/Chat.module.scss'
import PromptAndResponse from './PromptAndResponse'

export default () => {
  const [sandboxMode, setSandboxMode] = useState(false)
  const [codeBlocks, setCodeBlocks] = useState([])
  const [codeBlocksActive, setCodeBlocksActive] = useState(false)

  return (
    <div className={clx(styles.wrapper, codeBlocksActive ? styles.codeBlocksActive : '')}>
      <PromptAndResponse
        sandboxMode={sandboxMode}
        setCodeBlocks={setCodeBlocks}
        setSandboxMode={setSandboxMode}
        codeBlocksActive={codeBlocksActive}
        setCodeBlocksActive={setCodeBlocksActive}
      />

      <CodeBlocks
        codeBlocks={codeBlocks}
        sandboxMode={sandboxMode}
      />
    </div>
  )
}
