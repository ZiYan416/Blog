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
    ).toBe('https://example.com/favicon.ico')
    const favicon = link.querySelector('.link-favicon')
    const faviconImage = favicon?.querySelector<HTMLImageElement>('.link-favicon__image')
    expect(favicon?.querySelector('.link-favicon__fallback')).not.toBeNull()
    expect(faviconImage?.dataset.loaded).toBe('false')
    fireEvent.load(faviconImage!)
    expect(faviconImage?.dataset.loaded).toBe('true')
    expect(favicon?.nextSibling?.textContent).toBe('\u2060')
    expect(
      (favicon?.nextSibling as HTMLElement | null)?.dataset.copyExclude,
    ).toBe('true')
  })

  it('writes a selected table to the plain-text clipboard as TSV', () => {
    const { container } = render(
      <MarkdownRenderer content={'| 名称 | 值 |\n| --- | --- |\n| alpha | `1` |'} />,
    )
    const table = container.querySelector('table')
    expect(table).not.toBeNull()
    expect(table?.parentElement?.classList.contains('markdown-table-scroll')).toBe(
      true,
    )

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

  it('copies the original code text without toolbar content', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    render(<MarkdownRenderer content={'```typescript\nconst answer = 42\n```'} />)

    fireEvent.click(screen.getByTitle('Copy code'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('const answer = 42\n')
    })
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

  it('renders a heading serialized directly after an image as a heading', () => {
    render(
      <MarkdownRenderer
        content={'![配图](https://example.com/image.png)## 图片后的标题'}
      />,
    )

    expect(
      screen.getByRole('heading', { level: 2, name: '图片后的标题' }),
    ).not.toBeNull()
  })

  it('opens article images in a zoomable lightbox', () => {
    render(<MarkdownRenderer content={'![示例图片](https://example.com/image.png)'} />)
    const articleImage = screen.getByRole('img', { name: '示例图片' })

    fireEvent.click(articleImage)

    const dialog = screen.getByRole('dialog', { name: '图片预览' })
    const previewImage = dialog.querySelector<HTMLImageElement>('img')
    expect(previewImage?.style.transform).toContain('scale(1)')

    fireEvent.click(screen.getByRole('button', { name: '放大图片' }))
    expect(previewImage?.style.transform).toContain('scale(1.25)')

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: '图片预览' })).toBeNull()
  })
})
