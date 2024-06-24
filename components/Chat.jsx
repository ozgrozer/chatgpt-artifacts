import { useState } from 'react'

import clx from './../functions/clx'
import CodeBlocks from './CodeBlocks'
import styles from './../styles/chat.module.scss'
import PromptAndResponse from './PromptAndResponse'

export default () => {
  const [codeBlocks, setCodeBlocks] = useState([])

  return (
    <div className={clx(styles.wrapper, codeBlocks.length ? styles.codeBlocksActive : '')}>
      <PromptAndResponse
        setCodeBlocks={setCodeBlocks}
      />

      <CodeBlocks
        codeBlocks={codeBlocks}
      />
    </div>
  )
}
