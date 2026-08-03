import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownRenderer } from '../src/features/posts/components/markdown-renderer'

describe('MarkdownRenderer server boundary', () => {
  it('includes readable content and highlighted code in the server HTML', () => {
    const markup = renderToStaticMarkup(
      <MarkdownRenderer
        content={[
          '## Server rendered',
          '',
          '| Name | Value |',
          '| --- | --- |',
          '| alpha | `1` |',
          '',
          '```typescript',
          'const answer: number = 42',
          '```',
        ].join('\n')}
      />,
    )

    expect(markup).toContain('<article')
    expect(markup).toContain('id="server-rendered"')
    expect(markup).toContain('markdown-table-scroll')
    expect(markup).toContain('language-typescript')
    expect(markup).toContain('hljs-keyword')
    expect(markup).toContain('>const</span>')
    expect(markup).toContain('>answer</span>')
    expect(markup).not.toContain('node="[object Object]"')
  })

  it('removes executable raw HTML and unsafe link targets', () => {
    const markup = renderToStaticMarkup(
      <MarkdownRenderer
        content={[
          '<script>alert("script")</script>',
          '<img src="x" onerror="alert(1)" alt="safe-alt">',
          '[unsafe](javascript:alert(1))',
          '<iframe src="https://example.com"></iframe>',
        ].join('\n')}
      />,
    )

    expect(markup).not.toContain('<script')
    expect(markup).not.toContain('onerror')
    expect(markup).not.toMatch(/href="javascript:/)
    expect(markup).not.toContain('<iframe')
    expect(markup).toContain('safe-alt')
  })

  it('keeps the public renderer server-safe and the client shell lightweight', () => {
    const rendererSource = readFileSync(
      new URL('../src/features/posts/components/markdown-renderer.tsx', import.meta.url),
      'utf8',
    )
    const codeShellSource = readFileSync(
      new URL('../src/features/posts/components/code-block-shell.tsx', import.meta.url),
      'utf8',
    )

    expect(rendererSource.trimStart()).not.toMatch(/^['"]use client['"]/)
    expect(rendererSource).not.toContain('navigator.')
    expect(rendererSource).not.toContain('window.')
    expect(codeShellSource).not.toMatch(/from ['"]highlight\.js['"]/)
  })
})
