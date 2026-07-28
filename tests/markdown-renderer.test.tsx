// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { MarkdownRenderer } from '../src/features/posts/components/markdown-renderer'

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

  it('corrects legacy JavaScript labels on PowerShell command blocks', async () => {
    const content = "```javascript\nwinget search --id Microsoft.PowerShell --exact\n```"
    const { container } = render(<MarkdownRenderer content={content} />)

    await waitFor(() => {
      expect(container.querySelector('.article-code-block__language')?.textContent).toBe(
        'powershell',
      )
    })
    expect(container.querySelector('.article-code-block [title="自动识别的代码语言"]')).not.toBeNull()
  })

  it('keeps article images at intrinsic width and restores Bing originals', () => {
    const thumbnail =
      'https://tse1-mm.cn.bing.net/th/id/OIP-C.example?w=320&h=114&c=7'
    render(<MarkdownRenderer content={`![示例图片](${thumbnail})`} />)

    const image = screen.getByRole('img', { name: '示例图片' })
    expect(image.getAttribute('src')).toBe(
      'https://tse1-mm.cn.bing.net/th/id/OIP-C.example',
    )
    expect(image.getAttribute('loading')).toBe('lazy')
    expect(image.classList.contains('markdown-article-image')).toBe(true)
  })
})
