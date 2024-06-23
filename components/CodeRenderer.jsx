import { useRef, useEffect } from 'react'

export default ({ codeBlocks }) => {
  const html = codeBlocks.find(block => block.language === 'html')?.code || ''
  const css = codeBlocks.find(block => block.language === 'css')?.code || ''
  const js = codeBlocks.find(block => block.language === 'js')?.code || ''

  const iframeRef = useRef(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (iframe) {
      const document = iframe.contentDocument
      const content = `
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
