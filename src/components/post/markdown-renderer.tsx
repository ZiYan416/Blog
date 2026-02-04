"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import 'highlight.js/styles/github-dark.css'
import { Check, Copy } from 'lucide-react'
import { useState, useRef } from 'react'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none break-words prose-headings:font-bold prose-headings:tracking-tight prose-headings:leading-tight prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg md:prose-h1:text-3xl md:prose-h2:text-2xl md:prose-h3:text-xl prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-2xl prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-none">
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
  )
}

function PreBlock({ children, ...props }: any) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  // Extract language from the child <code> element's className if available
  // rehype-highlight adds class "hljs language-xyz" to the code element
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
    <div className="rounded-xl overflow-hidden my-4 md:my-6 border border-black/5 dark:border-white/5 shadow-sm bg-[#0d1117] group">
      {/* Mac-style Window Header */}
      <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 bg-[#161b22] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xs font-medium text-white/50 lowercase ml-2 font-mono">
            {language}
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Code Content Container */}
      <div className="overflow-x-auto">
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
