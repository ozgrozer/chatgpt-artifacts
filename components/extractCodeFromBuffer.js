export default buffer => {
  const regex = /```(?:(html|css|js|javascript)?\s*)\n([\s\S]*?)```/g
  const matches = [...buffer.matchAll(regex)]
  return matches.map(match => ({
    language: match[1] || 'javascript',
    code: match[2].trim()
  }))
}
