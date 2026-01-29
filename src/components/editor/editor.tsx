"use client"

import { useState, useRef, useEffect } from 'react'
import CodeEditor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-markdown'
import 'prismjs/themes/prism.css'
import { Toolbar, ViewMode, MarkdownAction } from './toolbar'
import { cn } from '@/lib/utils'
import { RichEditor } from './rich-editor'
import { Editor as TiptapEditor } from '@tiptap/react'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function Editor({ content, onChange, placeholder = '开始创作吧...' }: EditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('rich')
  const [tiptapEditor, setTiptapEditor] = useState<TiptapEditor | null>(null)

  // Refs for scrolling synchronization
  const sourceScrollRef = useRef<HTMLDivElement>(null)
  const richScrollRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)

  // Refs for editor instances (to restore focus/selection)
  const sourceEditorRef = useRef<any>(null)
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

  // Scroll Synchronization
  const handleScroll = (source: 'source' | 'rich', e: React.UIEvent<HTMLDivElement>) => {
    if (isScrollingRef.current) return

    const target = e.currentTarget
    const other = source === 'source' ? richScrollRef.current : sourceScrollRef.current

    if (!other) return

    isScrollingRef.current = true

    // Calculate percentage
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight)

    // Apply to other
    if (!isNaN(percentage)) {
      other.scrollTop = percentage * (other.scrollHeight - other.clientHeight)
    }

    // Debounce unlock
    setTimeout(() => {
      isScrollingRef.current = false
    }, 50)
  }

  const handleAction = (action: MarkdownAction) => {
    // If in Rich mode (or Split mode with focus preference), try Tiptap
    // We'll prioritize Tiptap in Rich/Split mode unless explicitly interacting with Source
    if ((viewMode === 'rich' || viewMode === 'split') && tiptapEditor && !tiptapEditor.isDestroyed) {
        switch (action) {
            case 'bold': tiptapEditor.chain().focus().toggleBold().run(); break;
            case 'italic': tiptapEditor.chain().focus().toggleItalic().run(); break;
            case 'h1': tiptapEditor.chain().focus().toggleHeading({ level: 1 }).run(); break;
            case 'h2': tiptapEditor.chain().focus().toggleHeading({ level: 2 }).run(); break;
            case 'list': tiptapEditor.chain().focus().toggleBulletList().run(); break;
            case 'ordered-list': tiptapEditor.chain().focus().toggleOrderedList().run(); break;
            case 'quote': tiptapEditor.chain().focus().toggleBlockquote().run(); break;
            case 'code': tiptapEditor.chain().focus().toggleCode().run(); break;
            case 'code-block': tiptapEditor.chain().focus().toggleCodeBlock().run(); break;
            case 'link':
                const url = window.prompt('URL')
                if (url) tiptapEditor.chain().focus().setLink({ href: url }).run();
                break;
            case 'image':
                const imgUrl = window.prompt('Image URL')
                if (imgUrl) tiptapEditor.chain().focus().setImage({ src: imgUrl }).run();
                break;
        }
        return
    }

    // Fallback to Source Editor manipulation
    const textarea = containerRef.current?.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = content
    const selectedText = text.substring(start, end)

    let insertStart = ''
    let insertEnd = ''
    let newCursorPos = start
    let newSelectionEnd = end

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

    setTimeout(() => {
      textarea.focus()
      if (selectedText) {
        textarea.setSelectionRange(newCursorPos, newSelectionEnd)
      } else {
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  return (
    <div className="w-full h-full border border-black/5 dark:border-white/5 bg-white dark:bg-neutral-900 rounded-[2rem] overflow-hidden transition-all focus-within:ring-1 ring-black/10 dark:ring-white/10 shadow-sm flex flex-col">
      <Toolbar viewMode={viewMode} onViewModeChange={setViewMode} onAction={handleAction} />

      <div className="flex-1 relative flex overflow-hidden">

        {/* Source Mode Editor (Left in Split, or Visible in Source Mode) */}
        <div className={cn(
          "h-full transition-all duration-300 flex flex-col bg-neutral-50/50 dark:bg-neutral-950/50",
          viewMode === 'source' ? "w-full" :
          viewMode === 'split' ? "w-1/2 border-r border-black/5 dark:border-white/5" : "hidden"
        )}>
          <div
            className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 font-mono text-sm"
            ref={sourceScrollRef}
            onScroll={(e) => handleScroll('source', e)}
          >
            <div ref={containerRef} className="min-h-full">
              <CodeEditor
                ref={sourceEditorRef}
                value={content}
                onValueChange={onChange}
                highlight={code => highlight(code, languages.markdown, 'markdown')}
                padding={10}
                placeholder="Source Mode..."
                className="font-mono text-base leading-relaxed bg-transparent min-h-full focus:outline-none text-neutral-600 dark:text-neutral-400"
                style={{
                  fontFamily: '"Fira Code", "JetBrains Mono", Menlo, Monaco, Consolas, "Courier New", monospace',
                  fontSize: 14,
                  backgroundColor: 'transparent',
                }}
                textareaClassName="focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Rich/Normal Mode Editor (Right in Split, or Visible in Rich Mode) */}
        <div className={cn(
          "h-full transition-all duration-300 flex flex-col bg-white dark:bg-neutral-900",
          viewMode === 'rich' ? "w-full" :
          viewMode === 'split' ? "w-1/2" : "hidden"
        )}>
           <div
            className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-8"
            ref={richScrollRef}
            onScroll={(e) => handleScroll('rich', e)}
           >
             <RichEditor
                content={content}
                onChange={onChange}
                onEditorReady={setTiptapEditor}
                placeholder={placeholder}
             />
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Reset CodeEditor Defaults */
        .npm__react-simple-code-editor__textarea {
          outline: none !important;
        }
        textarea {
          outline: none !important;
        }

        /* Tiptap Styles */
        .ProseMirror {
            outline: none;
            min-height: 100px;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
            color: #adb5bd;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
        }
      `}</style>
    </div>
  )
}
