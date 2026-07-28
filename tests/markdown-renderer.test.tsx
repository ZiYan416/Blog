// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { MarkdownRenderer } from '../src/components/post/markdown-renderer'

describe('MarkdownRenderer', () => {
  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )
    HTMLElement.prototype.scrollTo = vi.fn()
  })

  afterEach(cleanup)

  it('styles external links with an icon and safe new-tab attributes', () => {
    render(<MarkdownRenderer content="[示例链接](https://example.com)" />)

    const link = screen.getByRole('link', { name: '示例链接' })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(link.querySelector('.markdown-link__icon')).not.toBeNull()
  })

  it('recognizes explicit PowerShell aliases', () => {
    const content = "```pwsh\nGet-ChildItem | Where-Object { $_.Length -gt 1MB }\n```"
    const { container } = render(<MarkdownRenderer content={content} />)

    expect(container.querySelector('code.language-pwsh')).not.toBeNull()
    expect(container.querySelector('.article-code-block__language')?.textContent).toBe('pwsh')
    expect(container.querySelector('.hljs-built_in, .hljs-keyword, .hljs-variable')).not.toBeNull()
  })
})
