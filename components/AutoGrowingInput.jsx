import { useRef, useEffect } from 'react'

export default ({ value, className, placeholder, onChange, onSubmit }) => {
  const textareaRef = useRef(null)

  useEffect(() => {
    adjustHeight()
  }, [value])

  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      onSubmit(e)
    }
  }

  return (
    <textarea
      value={value}
      ref={textareaRef}
      onChange={onChange}
      className={className}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
    />
  )
}
