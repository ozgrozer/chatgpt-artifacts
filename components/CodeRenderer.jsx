import { useRef, useEffect, useMemo } from 'react'

import transformImports from '@functions/transformImports'

export default ({ codeBlocks }) => {
  const allItemsCompleted = codeBlocks.every(item => item.complete)
  if (!allItemsCompleted) return null

  const html = codeBlocks.find(block => block.language === 'html')?.code || ''
  const css = codeBlocks.find(block => block.language === 'css')?.code || ''
  const jsx = codeBlocks.find(block => block.language === 'jsx')?.code || ''
  const js = codeBlocks.find(block => block.language === 'js' || block.language === 'javascript')?.code || ''

  const iframeRef = useRef(null)

  const content = useMemo(() => {
    if (jsx) {
      const componentNameMatch = jsx.match(/export default (\w+);/)
      const componentName = componentNameMatch ? componentNameMatch[1] : null
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>${css}</style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.6/babel.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
          </head>
          <body>
            <div id="app"></div>
            ${html}
            <script type="text/babel">
              ${transformImports(jsx)}
              ReactDOM.render(<${componentName} />, document.getElementById('app'))
            </script>
          </body>
        </html>
      `
    } else {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>${css}</style>
          </head>
          <body>
            ${html}
            <script>${js}</script>
          </body>
        </html>
      `
    }
  }, [html, css, js, jsx])

  useEffect(() => {
    const iframe = iframeRef.current
    if (iframe) {
      iframe.srcdoc = content
    }
  }, [content])

  return (
    <iframe
      ref={iframeRef}
      sandbox='allow-scripts'
      style={{ width: '100%', height: '600px', border: 'none' }}
    />
  )
}
