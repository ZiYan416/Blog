export function extractCodeBlockLanguage(className?: string | null) {
  if (!className) return 'text'
  const match = /language-([\w-]+)/.exec(className)
  return match?.[1]?.toLowerCase() || 'text'
}

function hasPowerShellSignature(codeText: string) {
  return (
    /(?:^|\n)\s*(?:pwsh|powershell|winget)\b/im.test(codeText) ||
    /(?:^|\n)\s*(?:Get|Set|New|Remove|Start|Stop|Write|Where|ForEach)-[A-Za-z]+\b/m.test(codeText) ||
    /(?:^|[^\w])\$[A-Za-z_][\w:]*/.test(codeText) ||
    /\s-(?:eq|ne|gt|ge|lt|le|like|match|contains|not)\b/i.test(codeText)
  )
}

export function detectCodeLanguage(codeText: string): string | null {
  if (!codeText || codeText.trim().length < 3) return null
  return hasPowerShellSignature(codeText) ? 'powershell' : null
}
