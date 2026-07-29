"use client"

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  type ClipboardEvent,
  type ComponentPropsWithoutRef,
} from 'react'
import { CodeBlockShell, extractCodeBlockLanguage } from '@/features/posts/components/code-block-shell'
import { LinkFavicon } from '@/features/posts/components/link-favicon'
import {
  getMarkdownSelectionText,
  removeCopyExcludedElements,
} from '@/features/posts/markdown-copy'
import type { Schema } from 'hast-util-sanitize'
import { common } from 'lowlight'
import powershell from 'highlight.js/lib/languages/powershell'
import { getHighResolutionImageUrl } from '@/features/posts/image-url'

interface MarkdownRendererProps {
  content: string
}

const markdownSchema: Schema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    't',
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a || []),
      'target',
      'rel',
    ],
    code: [
      ...(defaultSchema.attributes?.code || []),
      ['className', /^language-/, /^hljs/],
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      ['className', /^hljs-/],
    ],
  },
}

const markdownComponents: Components & {
  t: (props: ComponentPropsWithoutRef<'span'>) => React.ReactNode
} = {
  pre: PreBlock,
  a: MarkdownLink,
  img: MarkdownImage,
  t: ({ children }) => <span className="font-mono text-sm">&lt;T&gt;{children}</span>,
}

const articleHighlightLanguages = {
  ...common,
  powershell,
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  useEffect(() => {
    const legacyThemeLink = document.getElementById('highlight-theme')
    if (legacyThemeLink) {
      legacyThemeLink.remove()
    }

    document
      .querySelectorAll('link[rel="stylesheet"]')
      .forEach((link) => {
        if (link instanceof HTMLLinkElement && link.href.includes('highlight.js')) {
          link.remove()
        }
      })
  }, [])

  const handleCopy = (event: ClipboardEvent<HTMLElement>) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return
    if (
      !event.currentTarget.contains(selection.anchorNode) ||
      !event.currentTarget.contains(selection.focusNode)
    ) {
      return
    }

    const fragment = selection.getRangeAt(0).cloneContents()
    removeCopyExcludedElements(fragment)
    const plainText = getMarkdownSelectionText(fragment)
    if (!plainText || !event.clipboardData) return

    const htmlContainer = document.createElement('div')
    htmlContainer.append(fragment.cloneNode(true))

    event.preventDefault()
    event.clipboardData.setData('text/plain', plainText)
    event.clipboardData.setData('text/html', htmlContainer.innerHTML)
  }

  return (
    <>
      <article
        className="markdown-article prose prose-neutral dark:prose-invert max-w-none break-words prose-headings:font-bold prose-headings:tracking-tight prose-headings:leading-tight prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg md:prose-h1:text-3xl md:prose-h2:text-2xl md:prose-h3:text-xl prose-img:rounded-2xl prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-none"
        onCopy={handleCopy}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            [rehypeSanitize, markdownSchema],
            rehypeSlug,
            [rehypeHighlight, {
              aliases: {
                powershell: ['pwsh', 'ps1'],
              },
              detect: true,
              languages: articleHighlightLanguages,
            }],
          ]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </article>

      {/* Enhanced Typography Styles for Article Detail */}
      <style jsx global>{`
        .markdown-article {
          --code-bg: #f5f7fb;
          --code-panel: #f5f7fb;
          --code-border: rgba(15, 23, 42, 0.08);
          --code-header-bg: rgba(148, 163, 184, 0.12);
          --code-fg: #253041;
          --code-muted: #607089;
          --code-keyword: #9a3412;
          --code-string: #0f766e;
          --code-number: #b45309;
          --code-comment: #7c8798;
          --code-function: #1d4ed8;
          --code-variable: #c2410c;
          --code-type: #7c3aed;
          --code-meta: #0369a1;
        }

        .dark .markdown-article {
          --code-bg: #0f1722;
          --code-panel: #0f1722;
          --code-border: rgba(148, 163, 184, 0.16);
          --code-header-bg: rgba(148, 163, 184, 0.1);
          --code-fg: #d6deeb;
          --code-muted: #8fa0b8;
          --code-keyword: #f38ba8;
          --code-string: #8bd5ca;
          --code-number: #f6c177;
          --code-comment: #6b7a90;
          --code-function: #8cc7ff;
          --code-variable: #ffb86b;
          --code-type: #c4b5fd;
          --code-meta: #7dd3fc;
        }

        /* === Headings === */
        .markdown-article h1 {
          padding-bottom: 0.3em;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          margin-top: 1.5em;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .dark .markdown-article h1 {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .markdown-article h2 {
          padding-bottom: 0.25em;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          margin-top: 1.4em;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .dark .markdown-article h2 {
          border-bottom-color: rgba(255, 255, 255, 0.05);
        }

        .markdown-article h3,
        .markdown-article h4,
        .markdown-article h5,
        .markdown-article h6 {
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .markdown-article h1:first-child,
        .markdown-article h2:first-child,
        .markdown-article h3:first-child {
          margin-top: 0;
        }

        /* === Inline Code === */
        .markdown-article :not(pre) > code {
          background-color: rgba(0, 0, 0, 0.06);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 0.875em;
          font-family: "Fira Code", "JetBrains Mono", Menlo, Monaco, Consolas, monospace;
          color: #e83e8c;
          word-break: break-word;
        }
        .dark .markdown-article :not(pre) > code {
          background-color: rgba(255, 255, 255, 0.1);
          color: #f0a6ca;
        }

        /* === Code Blocks === */
        .markdown-article pre {
          margin: 0;
          background-color: var(--code-bg) !important;
          color: var(--code-fg);
          box-shadow: none;
        }

        .markdown-article pre code,
        .markdown-article pre code.hljs {
          display: block;
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }

        .markdown-article .hljs {
          display: block;
          background: transparent;
          color: var(--code-fg);
        }

        .markdown-article .hljs-comment,
        .markdown-article .hljs-quote {
          color: var(--code-comment);
          font-style: italic;
        }

        .markdown-article .hljs-keyword,
        .markdown-article .hljs-selector-tag,
        .markdown-article .hljs-built_in,
        .markdown-article .hljs-name,
        .markdown-article .hljs-tag {
          color: var(--code-keyword);
        }

        .markdown-article .hljs-string,
        .markdown-article .hljs-attr,
        .markdown-article .hljs-selector-attr,
        .markdown-article .hljs-selector-pseudo,
        .markdown-article .hljs-template-variable {
          color: var(--code-string);
        }

        .markdown-article .hljs-number,
        .markdown-article .hljs-literal,
        .markdown-article .hljs-symbol,
        .markdown-article .hljs-bullet {
          color: var(--code-number);
        }

        .markdown-article .hljs-title,
        .markdown-article .hljs-title.function_,
        .markdown-article .hljs-function,
        .markdown-article .hljs-section {
          color: var(--code-function);
        }

        .markdown-article .hljs-variable,
        .markdown-article .hljs-property,
        .markdown-article .hljs-params,
        .markdown-article .hljs-attribute {
          color: var(--code-variable);
        }

        .markdown-article .hljs-type,
        .markdown-article .hljs-class .hljs-title,
        .markdown-article .hljs-title.class_ {
          color: var(--code-type);
        }

        .markdown-article .hljs-meta,
        .markdown-article .hljs-doctag,
        .markdown-article .hljs-regexp,
        .markdown-article .hljs-link {
          color: var(--code-meta);
        }

        .markdown-article .hljs-subst {
          color: var(--code-fg);
        }

        /* === Blockquote === */
        .markdown-article blockquote {
          border-left: 4px solid #6366f1 !important;
          background-color: rgba(99, 102, 241, 0.04);
          border-radius: 0 8px 8px 0;
          padding: 0.6em 1em;
          color: #444;
        }
        .dark .markdown-article blockquote {
          border-left-color: #818cf8 !important;
          background-color: rgba(129, 140, 248, 0.06);
          color: #bbb;
        }

        /* === Links === */
        .markdown-article a {
          color: #9a5b13;
          font-weight: 600;
          text-decoration: none !important;
          border-radius: 0.3em;
          margin: 0 -0.1em;
          padding: 0.05em 0.1em;
          transition: color 0.15s ease, background-color 0.15s ease;
        }
        .markdown-article a:hover {
          color: #b45309;
          background-color: rgba(180, 83, 9, 0.08);
          text-decoration: none !important;
        }
        .dark .markdown-article a {
          color: #e6b86f;
        }
        .dark .markdown-article a:hover {
          color: #f6c875;
          background-color: rgba(246, 200, 117, 0.1);
        }
        .markdown-article .markdown-link__favicon {
          margin-right: 0.28em;
          vertical-align: -0.08em;
        }
        .markdown-article a:hover .markdown-link__favicon {
          opacity: 1;
        }
        .markdown-article .link-favicon {
          display: inline-flex;
          width: 0.9em;
          height: 0.9em;
          align-items: center;
          justify-content: center;
          opacity: 0.78;
          transition: opacity 0.15s ease;
          user-select: none;
        }
        .markdown-article .link-favicon__image,
        .markdown-article .link-favicon__fallback {
          display: inline-block;
          width: 100%;
          height: 100%;
          max-width: none;
          margin: 0;
          object-fit: contain;
          box-shadow: none;
        }

        /* === Horizontal Rule === */
        .markdown-article hr {
          border: none !important;
          height: 1px;
          margin: 2em 0;
          background: linear-gradient(to right, transparent, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.15) 80%, transparent);
        }
        .dark .markdown-article hr {
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.1) 80%, transparent);
        }

        /* === Tables === */
        .markdown-article table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.1);
          display: block;
          overflow-x: auto;
        }
        .dark .markdown-article table {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .markdown-article th,
        .markdown-article td {
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 0.5em 0.75em;
          min-width: 80px;
          text-align: left;
          word-break: break-word;
        }
        .dark .markdown-article th,
        .dark .markdown-article td {
          border-color: rgba(255, 255, 255, 0.08);
        }

        .markdown-article th {
          background-color: rgba(0, 0, 0, 0.04);
          font-weight: 600;
          font-size: 0.9em;
        }
        .dark .markdown-article th {
          background-color: rgba(255, 255, 255, 0.06);
        }

        .markdown-article tr:nth-child(even) td {
          background-color: rgba(0, 0, 0, 0.015);
        }
        .dark .markdown-article tr:nth-child(even) td {
          background-color: rgba(255, 255, 255, 0.02);
        }

        /* === Task List (GFM checkboxes) === */
        .markdown-article ul li input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          cursor: default;
          position: relative;
          vertical-align: middle;
          margin-right: 0.4em;
          flex-shrink: 0;
        }

        .markdown-article ul li input[type="checkbox"]:checked {
          background-color: #6366f1;
          border-color: #6366f1;
        }

        .markdown-article ul li input[type="checkbox"]:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        .dark .markdown-article ul li input[type="checkbox"] {
          border-color: #4b5563;
        }

        .dark .markdown-article ul li input[type="checkbox"]:checked {
          background-color: #818cf8;
          border-color: #818cf8;
        }

        /* === Highlight === */
        .markdown-article mark {
          background-color: #fff3bf;
          border-radius: 2px;
          padding: 1px 3px;
        }
        .dark .markdown-article mark {
          background-color: rgba(255, 243, 191, 0.2);
          color: #ffd43b;
        }

        /* === Images === */
        .markdown-article img {
          display: block;
          width: auto;
          max-width: 100%;
          height: auto;
          margin-left: auto;
          margin-right: auto;
          object-fit: contain;
          image-rendering: auto;
          transition: box-shadow 0.2s ease;
        }
        .markdown-article img:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .dark .markdown-article img:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        /* === Selection === */
        .markdown-article ::selection {
          background-color: rgba(99, 102, 241, 0.2);
        }

        /* === Mobile: prevent long words from overflowing === */
        @media (max-width: 768px) {
          .markdown-article {
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .markdown-article pre {
            max-width: 100%;
          }

          .markdown-article table {
            font-size: 0.85em;
          }
        }
      `}</style>
    </>
  )
}

function MarkdownImage({
  node: _node,
  src = '',
  alt = '',
  className,
  loading = 'lazy',
  decoding = 'async',
  ...props
}: ComponentPropsWithoutRef<'img'> & { node?: unknown }) {
  void _node

  if (typeof src !== 'string' || !src) return null

  const displaySrc = getHighResolutionImageUrl(src)

  return (
    // The intrinsic size of a native image lets CSS shrink large assets without
    // enlarging smaller ones. Next Image requires invented dimensions here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={displaySrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={['markdown-article-image', className].filter(Boolean).join(' ')}
      data-original-src={displaySrc !== src ? src : undefined}
    />
  )
}

function MarkdownLink({
  node: _node,
  href = '',
  children,
  ...props
}: ComponentPropsWithoutRef<'a'> & { node?: unknown }) {
  void _node
  const isExternal = /^(?:https?:)?\/\//i.test(href)
  const hasImage = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === 'img',
  )

  return (
    <a
      {...props}
      href={href}
      target={isExternal ? '_blank' : props.target}
      rel={isExternal ? 'noopener noreferrer' : props.rel}
    >
      {!hasImage ? <LinkFavicon href={href} className="markdown-link__favicon" /> : null}
      {children}
    </a>
  )
}

function PreBlock({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null)
  const codeElement = Children.toArray(children).find(
    (child) => isValidElement<{ className?: string }>(child),
  )
  const className = codeElement?.props.className
  const language = extractCodeBlockLanguage(className)

  return (
    <CodeBlockShell
      language={language}
      onCopy={() => navigator.clipboard.writeText(preRef.current?.innerText || '')}
    >
      <pre {...props} ref={preRef} className="article-code-block__pre">
        {children}
      </pre>
    </CodeBlockShell>
  )
}
