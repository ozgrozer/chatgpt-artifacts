export default code => {
  // Regular expression to match import statements from 'react'
  const importRegex =
    /import\s+(?:(\w+)\s*,?\s*)?(?:{([^}]+)})?\s+from\s+['"]react['"];?/g

  let transformedCode = code
  let match
  let defaultImport = ''
  const namedImports = new Set()

  // Collect all imports
  while ((match = importRegex.exec(code)) !== null) {
    if (match[1]) {
      defaultImport = match[1].trim()
    }
    if (match[2]) {
      match[2].split(',').forEach((imp) => namedImports.add(imp.trim()))
    }
  }

  // Remove original import statements
  transformedCode = transformedCode.replace(importRegex, '')

  // Add transformed imports at the beginning of the code
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
  const removeExportPart = result.replace(/export\s+default\s+App;/, '')
  return removeExportPart
}
