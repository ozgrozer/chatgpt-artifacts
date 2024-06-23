import { useRef, useEffect } from 'react'

export default ({ html, css, js }) => {
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
