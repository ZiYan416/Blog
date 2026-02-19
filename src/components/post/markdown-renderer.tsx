"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import { Check, Copy } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Load appropriate highlight.js theme based on system theme
  useEffect(() => {
    const loadTheme = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const themeLink = document.getElementById('highlight-theme') as HTMLLinkElement

      if (themeLink) {
        themeLink.href = isDark
          ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css'
          : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css'
      } else {
        const link = document.createElement('link')
        link.id = 'highlight-theme'
        link.rel = 'stylesheet'
        link.href = isDark
          ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css'
          : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css'
        document.head.appendChild(link)
      }
    }

    loadTheme()

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          loadTheme()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <article className="markdown-article prose prose-neutral dark:prose-invert max-w-none break-words prose-headings:font-bold prose-headings:tracking-tight prose-headings:leading-tight prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg md:prose-h1:text-3xl md:prose-h2:text-2xl md:prose-h3:text-xl prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-2xl prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug, rehypeHighlight, rehypeRaw]}
          components={{
            pre: PreBlock,
            // Handle <t> tags (often unescaped generics like <T>)
            t: ({ children }: any) => <span className="font-mono text-sm">&lt;T&gt;{children}</span>
          } as any}
        >
          {content}
        </ReactMarkdown>
      </article>

      {/* Enhanced Typography Styles for Article Detail */}
      <style jsx global>{`
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
          transition: all 0.15s ease;
          border-bottom: 1px solid transparent;
        }
        .markdown-article a:hover {
          border-bottom-color: currentColor;
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

function PreBlock({ children, ...props }: any) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  // Extract language from the child <code> element's className if available
  let language = 'text'
  if (children && typeof children === 'object' && 'props' in children && children.props.className) {
    const match = /language-(\w+)/.exec(children.props.className)
    if (match) language = match[1]
  }

  const copyToClipboard = () => {
    if (preRef.current) {
      const code = preRef.current.innerText
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-xl overflow-hidden my-4 md:my-6 border border-black/10 dark:border-white/10 shadow-lg bg-white dark:bg-[#0d1117] group transition-colors">
      {/* Mac-style Window Header */}
      <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 bg-neutral-100 dark:bg-[#161b22] border-b border-black/10 dark:border-white/5 transition-colors">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] dark:bg-[#ff5f56] border border-[#e0443e] dark:border-[#e0443e] opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] dark:bg-[#ffbd2e] border border-[#dea123] dark:border-[#dea123] opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] dark:bg-[#27c93f] border border-[#1aab29] dark:border-[#1aab29] opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xs font-medium text-neutral-500 dark:text-white/50 lowercase ml-2 font-mono transition-colors">
            {language}
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="text-neutral-400 dark:text-white/40 hover:text-neutral-700 dark:hover:text-white transition-colors p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-white/10"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Code Content Container */}
      <div className="overflow-x-auto bg-neutral-50 dark:bg-transparent transition-colors">
        <pre
          {...props}
          ref={preRef}
          className="!m-0 !p-3 md:!p-4 !bg-transparent font-mono text-sm leading-relaxed whitespace-pre overflow-x-auto md:whitespace-pre-wrap md:break-words md:overflow-visible"
        >
          {children}
        </pre>
      </div>
    </div>
  )
}
