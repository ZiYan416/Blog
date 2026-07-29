// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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

  afterEach(() => {
    window.getSelection()?.removeAllRanges()
    cleanup()
  })

  it('shows the linked website favicon with safe new-tab attributes', () => {
    render(<MarkdownRenderer content="[示例链接](https://example.com)" />)

    const link = screen.getByRole('link', { name: '示例链接' })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(
      link.querySelector<HTMLImageElement>('.link-favicon__image')?.src,
    ).toBe('https://icons.duckduckgo.com/ip3/example.com.ico')
  })

  it('writes a selected table to the plain-text clipboard as TSV', () => {
    const { container } = render(
      <MarkdownRenderer content={'| 名称 | 值 |\n| --- | --- |\n| alpha | `1` |'} />,
    )
    const table = container.querySelector('table')
    expect(table).not.toBeNull()

    const range = document.createRange()
    range.selectNode(table!)
    window.getSelection()?.addRange(range)
    const setData = vi.fn()

    fireEvent.copy(table!, {
      clipboardData: { setData },
    })

    expect(setData).toHaveBeenCalledWith(
      'text/plain',
      '名称\t值\nalpha\t1',
    )
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
