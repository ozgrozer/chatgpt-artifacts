export default (code) => {
  const importReactRegex =
    /import\s+(?:(\w+)\s*,?\s*)?(?:{([^}]+)})?\s+from\s+['"]react['"];?/g
  const importCssRegex = /import\s+['"]([^'"]+\.css)['"];?/g

  let transformedCode = code
  let match
  let defaultImport = ''
  const namedImports = new Set()

  // Remove and process React imports
  while ((match = importReactRegex.exec(code)) !== null) {
    if (match[1]) {
      defaultImport = match[1].trim()
    }
    if (match[2]) {
      match[2].split(',').forEach((imp) => namedImports.add(imp.trim()))
    }
  }

  transformedCode = transformedCode.replace(importReactRegex, '')

  // Remove CSS imports
  transformedCode = transformedCode.replace(importCssRegex, '')

  let newImports = ''
  if (defaultImport) {
    newImports += `const ${defaultImport} = window.React;\n`
  } else {
    newImports += 'const React = window.React;\n'
  }
  if (namedImports.size > 0) {
    newImports += `const { ${Array.from(namedImports).join(', ')} } = React;\n`
  }

  const result = newImports + transformedCode

  // Remove export component
  const removeExportPart = result.replace(/export default \w+;\s*$/, '')

  return removeExportPart
}
