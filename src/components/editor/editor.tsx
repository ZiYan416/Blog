"use client"

import { useState, useRef, useEffect } from 'react'
import CodeEditor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-markdown'
import 'prismjs/themes/prism.css' // We'll override this with our own minimal styles if needed
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import 'highlight.js/styles/github-dark.css'
import { Toolbar, ViewMode, MarkdownAction } from './toolbar'
import { cn } from '@/lib/utils'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function Editor({ content, onChange, placeholder = '开始创作吧...' }: EditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  // Ref to access the underlying textarea for cursor manipulation
  // react-simple-code-editor exposes the textarea via a ref prop but it might be nested
  // Actually, looking at the type definition or source, we can try to get the textarea element
  const editorRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Ensure Prism languages are loaded
  useEffect(() => {
    import('prismjs/components/prism-markdown')
    import('prismjs/components/prism-javascript')
    import('prismjs/components/prism-typescript')
    import('prismjs/components/prism-css')
    import('prismjs/components/prism-json')
    import('prismjs/components/prism-bash')
  }, [])

  const handleAction = (action: MarkdownAction) => {
    // Access the internal textarea element from the editor ref
    // We search within our container div to find the textarea
    const textarea = containerRef.current?.querySelector('textarea')

    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = content // Use props content as source of truth
    const selectedText = text.substring(start, end)

    let insertStart = ''
    let insertEnd = ''
    let newCursorPos = start
    let newSelectionEnd = end

    // Helper to ensure we are at the start of a line or add a newline
    const ensureStartOfLine = () => {
       const beforeCursor = text.substring(0, start)
       if (beforeCursor && beforeCursor.slice(-1) !== '\n' && start !== 0) {
         return '\n'
       }
       return ''
    }

    switch (action) {
      case 'bold':
        insertStart = '**'
        insertEnd = '**'
        newCursorPos = start + 2
        newSelectionEnd = end + 2
        break
      case 'italic':
        insertStart = '*'
        insertEnd = '*'
        newCursorPos = start + 1
        newSelectionEnd = end + 1
        break
      case 'h1':
        insertStart = ensureStartOfLine() + '# '
        newCursorPos = start + insertStart.length
        newSelectionEnd = end + insertStart.length
        break
      case 'h2':
        insertStart = ensureStartOfLine() + '## '
        newCursorPos = start + insertStart.length
        newSelectionEnd = end + insertStart.length
        break
      case 'list':
        insertStart = ensureStartOfLine() + '- '
        newCursorPos = start + insertStart.length
        newSelectionEnd = end + insertStart.length
        break
      case 'ordered-list':
        insertStart = ensureStartOfLine() + '1. '
        newCursorPos = start + insertStart.length
        newSelectionEnd = end + insertStart.length
        break
      case 'quote':
        insertStart = ensureStartOfLine() + '> '
        newCursorPos = start + insertStart.length
        newSelectionEnd = end + insertStart.length
        break
      case 'code':
        insertStart = '`'
        insertEnd = '`'
        newCursorPos = start + 1
        newSelectionEnd = end + 1
        break
      case 'code-block':
        insertStart = ensureStartOfLine() + '```\n'
        insertEnd = '\n```'
        newCursorPos = start + insertStart.length
        newSelectionEnd = end + insertStart.length
        break
      case 'link':
        insertStart = '['
        insertEnd = '](url)'
        newCursorPos = start + 1
        newSelectionEnd = end + 1
        break
      case 'image':
        insertStart = '!['
        insertEnd = '](image-url)'
        newCursorPos = start + 2
        newSelectionEnd = end + 2
        break
    }

    const newText = text.substring(0, start) + insertStart + selectedText + insertEnd + text.substring(end)
    onChange(newText)

    // Restore focus and update cursor position
    setTimeout(() => {
      textarea.focus()
      if (selectedText) {
        textarea.setSelectionRange(newCursorPos, newSelectionEnd)
      } else {
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const Preview = () => (
    <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-2xl prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-800 prose-pre:border prose-pre:border-black/5 dark:prose-pre:border-white/5 py-8 px-4 sm:px-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight, rehypeRaw]}
      >
        {content || '*暂无内容*'}
      </ReactMarkdown>
    </article>
  )

  return (
    <div className="w-full h-full border border-black/5 dark:border-white/5 bg-white dark:bg-neutral-900 rounded-[2rem] overflow-hidden transition-all focus-within:ring-1 ring-black/10 dark:ring-white/10 shadow-sm flex flex-col">
      <Toolbar viewMode={viewMode} onViewModeChange={setViewMode} onAction={handleAction} />

      <div className="flex-1 relative flex overflow-hidden">
        {/* Write Mode */}
        <div className={cn(
          "h-full transition-all duration-300 flex flex-col",
          viewMode === 'edit' ? "w-full" :
          viewMode === 'split' ? "w-1/2 border-r border-black/5 dark:border-white/5" : "hidden"
        )}>
          <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 font-mono text-sm" ref={containerRef}>
            <CodeEditor
              ref={editorRef}
              value={content}
              onValueChange={onChange}
              highlight={code => highlight(code, languages.markdown, 'markdown')}
              padding={10}
              placeholder={placeholder}
              className="font-mono text-base leading-relaxed bg-transparent min-h-full focus:outline-none"
              style={{
                fontFamily: '"Fira Code", "JetBrains Mono", Menlo, Monaco, Consolas, "Courier New", monospace',
                fontSize: 16,
                backgroundColor: 'transparent',
              }}
              textareaClassName="focus:outline-none"
            />
          </div>
        </div>

        {/* Preview Mode */}
        <div className={cn(
          "h-full overflow-y-auto bg-neutral-50/30 dark:bg-neutral-950/30 transition-all duration-300",
          viewMode === 'preview' ? "w-full" :
          viewMode === 'split' ? "w-1/2 block" : "hidden"
        )}>
          <Preview />
        </div>
      </div>

      {/* Global styles for custom prism theme overrides if necessary */}
      <style jsx global>{`
        /* Custom Prism overrides to match Typora/clean look */
        code[class*="language-"],
        pre[class*="language-"] {
          text-shadow: none !important;
          background: transparent !important;
        }

        /* Make sure the editor text color matches the theme */
        .npm__react-simple-code-editor__textarea {
          outline: none !important;
        }

        textarea {
            outline: none !important;
        }
      `}</style>
    </div>
  )
}
