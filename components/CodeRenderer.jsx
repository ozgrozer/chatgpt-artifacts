import { useRef, useEffect } from 'react'

export default ({ codeBlocks }) => {
  const html = codeBlocks.find(block => block.language === 'html')?.code || ''
  const css = codeBlocks.find(block => block.language === 'css')?.code || ''
  const jsx = codeBlocks.find(block => block.language === 'jsx')?.code || ''
  const js = codeBlocks.find(block => block.language === 'js' || block.language === 'javascript')?.code || ''

  const iframeRef = useRef(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (iframe) {
      const document = iframe.contentDocument
      let content = ''
      if (jsx) {
        content = `
        <html>
          <head>
            <style>${css}</style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.6/babel.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
          </head>
          <body>
            <div id="app"></div>
            ${html}
            <script type="text/babel">
              ${jsx}
              ReactDOM.render(<App />, document.getElementById('app'))
            </script>
          </body>
        </html>
      `
      } else {
        content = `
          <html>
            <head>
              <style>${css}</style>
            </head>
            <body>
              ${html}
              <script>${js}</script>
            </body>
          </html>
        `
      }
      document.open()
      document.write(content)
      document.close()
    }
  }, [html, css, js])

  return (
    <iframe
      ref={iframeRef}
      style={{ width: '100%', height: '600px', border: 'none' }}
    />
  )
}
