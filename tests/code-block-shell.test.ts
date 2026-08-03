import { describe, expect, it } from 'vitest'
import {
  detectCodeLanguage,
  extractCodeBlockLanguage,
} from '../src/features/posts/code-block-language'

describe('code block language helpers', () => {
  it('extracts an explicit language from a Markdown code class', () => {
    expect(extractCodeBlockLanguage('hljs language-pwsh')).toBe('pwsh')
  })

  it('auto-detects characteristic PowerShell syntax', () => {
    const code = [
      "$service = Get-Service -Name 'Spooler'",
      "if ($service.Status -ne 'Running') {",
      '  Start-Service $service.Name',
      '}',
    ].join('\n')

    expect(detectCodeLanguage(code)).toBe('powershell')
  })

  it('treats winget commands as PowerShell instead of generic stylesheet syntax', () => {
    expect(
      detectCodeLanguage('winget install --id Microsoft.PowerShell --source winget'),
    ).toBe('powershell')
  })
})
