import { useRef } from 'react'

import clx from '@functions/clx'
import CodeBlocks from './CodeBlocks'
import styles from '@styles/Chat.module.scss'
import PromptAndResponse from './PromptAndResponse'
import { AppProvider, useAppContext } from '@contexts/AppContext'

const App = () => {
  const { state } = useAppContext()
  const { codeBlocksActive } = state

  const hasCalledBackend = useRef(false)

  return (
    <div
      className={clx(
        styles.wrapper,
        codeBlocksActive ? styles.codeBlocksActive : ''
      )}
    >
      <PromptAndResponse
        hasCalledBackend={hasCalledBackend}
      />

      <CodeBlocks
        hasCalledBackend={hasCalledBackend}
      />
    </div>
  )
}

export default () => {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  )
}
