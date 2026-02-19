"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import CodeEditor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-markdown'
import 'prismjs/themes/prism.css'
import { Toolbar, ViewMode, MarkdownAction } from './toolbar'
import { cn } from '@/lib/utils'
import { RichEditor } from './rich-editor'
import type { Editor as TiptapEditor } from '@tiptap/react'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { useToast } from '@/hooks/use-toast'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function Editor({ content, onChange, placeholder = '开始创作吧...' }: EditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('rich')
  const [tiptapEditor, setTiptapEditor] = useState<TiptapEditor | null>(null)
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)

  // Force re-render when editor state changes (for toolbar active states)
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    if (!tiptapEditor) return
    const handler = () => forceUpdate((n) => n + 1)
    tiptapEditor.on('selectionUpdate', handler)
    tiptapEditor.on('transaction', handler)
    return () => {
      tiptapEditor.off('selectionUpdate', handler)
      tiptapEditor.off('transaction', handler)
    }
  }, [tiptapEditor])

  // Refs for editor instances
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

  // Memoize highlight function
  const highlightCode = useCallback((code: string) => {
    return highlight(code, languages.markdown, 'markdown')
  }, [])

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true)
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error: any) {
      console.error('Image upload failed:', error)
      toast({
        title: "图片上传失败",
        description: error.message,
        variant: "destructive"
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSourcePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const imageItem = items.find(item => item.type.startsWith('image'))

    if (imageItem) {
      e.preventDefault()
      const file = imageItem.getAsFile()
      if (file) {
        const textarea = containerRef.current?.querySelector('textarea')
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd

        const placeholderText = `![Uploading ${file.name}...]()`
        const beforeCursor = content.substring(0, start)
        const afterCursor = content.substring(end)
        const newText = beforeCursor + placeholderText + afterCursor

        const newCursorPos = start + placeholderText.length
        onChange(newText)

        setTimeout(() => {
          const textarea = containerRef.current?.querySelector('textarea')
          if (textarea) {
            textarea.focus()
            textarea.setSelectionRange(newCursorPos, newCursorPos)
          }
        }, 0)

        const url = await handleImageUpload(file)

        if (url) {
          const imageMarkdown = `![image](${url})`
          const finalText = newText.replace(placeholderText, imageMarkdown)
          const finalCursorPos = start + imageMarkdown.length
          onChange(finalText)
          setTimeout(() => {
            const textarea = containerRef.current?.querySelector('textarea')
            if (textarea) {
              textarea.focus()
              textarea.setSelectionRange(finalCursorPos, finalCursorPos)
            }
          }, 0)
        } else {
          onChange(content)
          setTimeout(() => {
            const textarea = containerRef.current?.querySelector('textarea')
            if (textarea) {
              textarea.focus()
              textarea.setSelectionRange(start, end)
            }
          }, 0)
        }
      }
    }
  }, [content, onChange, containerRef])

  const handleAction = (action: MarkdownAction) => {
    // If in Rich mode (or Split mode), try Tiptap first
    if ((viewMode === 'rich' || viewMode === 'split') && tiptapEditor && !tiptapEditor.isDestroyed) {
      switch (action) {
        case 'bold': tiptapEditor.chain().focus().toggleBold().run(); break;
        case 'italic': tiptapEditor.chain().focus().toggleItalic().run(); break;
        case 'underline': tiptapEditor.chain().focus().toggleUnderline().run(); break;
        case 'highlight': tiptapEditor.chain().focus().toggleHighlight().run(); break;
        case 'h1': tiptapEditor.chain().focus().toggleHeading({ level: 1 }).run(); break;
        case 'h2': tiptapEditor.chain().focus().toggleHeading({ level: 2 }).run(); break;
        case 'h3': tiptapEditor.chain().focus().toggleHeading({ level: 3 }).run(); break;
        case 'list': tiptapEditor.chain().focus().toggleBulletList().run(); break;
        case 'ordered-list': tiptapEditor.chain().focus().toggleOrderedList().run(); break;
        case 'task-list': tiptapEditor.chain().focus().toggleTaskList().run(); break;
        case 'quote': tiptapEditor.chain().focus().toggleBlockquote().run(); break;
        case 'code': tiptapEditor.chain().focus().toggleCode().run(); break;
        case 'code-block': tiptapEditor.chain().focus().toggleCodeBlock().run(); break;
        case 'hr': tiptapEditor.chain().focus().setHorizontalRule().run(); break;
        case 'link': {
          const url = window.prompt('URL')
          if (url) tiptapEditor.chain().focus().setLink({ href: url }).run();
          break;
        }
        case 'image': {
          const imgUrl = window.prompt('Image URL')
          if (imgUrl) tiptapEditor.chain().focus().setImage({ src: imgUrl }).run();
          break;
        }
        case 'table':
          tiptapEditor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          break;
        case 'align-left': tiptapEditor.chain().focus().setTextAlign('left').run(); break;
        case 'align-center': tiptapEditor.chain().focus().setTextAlign('center').run(); break;
        case 'align-right': tiptapEditor.chain().focus().setTextAlign('right').run(); break;
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
      case 'underline':
        insertStart = '<u>'
        insertEnd = '</u>'
        newCursorPos = start + 3
        newSelectionEnd = end + 3
        break
      case 'highlight':
        insertStart = '=='
        insertEnd = '=='
        newCursorPos = start + 2
        newSelectionEnd = end + 2
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
      case 'h3':
        insertStart = ensureStartOfLine() + '### '
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
      case 'task-list':
        insertStart = ensureStartOfLine() + '- [ ] '
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
      case 'table':
        insertStart = ensureStartOfLine() + '| 标题1 | 标题2 | 标题3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n'
        newCursorPos = start + insertStart.length
        newSelectionEnd = newCursorPos
        break
      case 'hr':
        insertStart = ensureStartOfLine() + '\n---\n'
        newCursorPos = start + insertStart.length
        newSelectionEnd = newCursorPos
        break
      case 'align-left':
      case 'align-center':
      case 'align-right':
        // Text alignment is not natively supported in standard Markdown
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
    <div className="w-full border border-black/5 dark:border-white/5 bg-white dark:bg-neutral-900 rounded-2xl md:rounded-[2rem] transition-all focus-within:ring-1 ring-black/10 dark:ring-white/10 shadow-sm flex flex-col relative">
      <div className="sticky top-16 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 rounded-t-2xl md:rounded-t-[2rem]">
        <Toolbar viewMode={viewMode} onViewModeChange={setViewMode} onAction={handleAction} editor={tiptapEditor} />
      </div>

      <div className="flex-1 relative flex min-h-[calc(100vh-14rem)]">

        {/* Source Mode Editor */}
        <div className={cn(
          "transition-all duration-300 flex flex-col bg-neutral-50/50 dark:bg-neutral-950/50",
          viewMode === 'source' ? "w-full" :
            viewMode === 'split' ? "w-1/2 border-r border-black/5 dark:border-white/5" : "hidden"
        )}>
          <div
            className="flex-1 min-h-0 p-3 sm:p-4 md:p-6 font-mono text-sm"
          >
            <div ref={containerRef} className="min-h-full">
              <CodeEditor
                ref={sourceEditorRef}
                value={content}
                onValueChange={onChange}
                highlight={highlightCode}
                padding={10}
                placeholder="Source Mode..."
                className="font-mono text-base leading-relaxed bg-transparent min-h-full focus:outline-none text-neutral-600 dark:text-neutral-400"
                style={{
                  fontFamily: '"Fira Code", "JetBrains Mono", Menlo, Monaco, Consolas, "Courier New", monospace',
                  fontSize: 14,
                  backgroundColor: 'transparent',
                }}
                textareaClassName="focus:outline-none"
                // @ts-ignore
                onPaste={handleSourcePaste}
              />
            </div>
          </div>
        </div>

        {/* Rich/Normal Mode Editor */}
        <div className={cn(
          "transition-all duration-300 flex flex-col bg-white dark:bg-neutral-900",
          viewMode === 'rich' ? "w-full" :
            viewMode === 'split' ? "w-1/2" : "hidden"
        )}>
          <div
            className="flex-1 min-h-0 p-3 sm:p-4 md:p-8"
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

        /* ============================================
           ProseMirror / TipTap Editor Styles
           Typora-like rich text rendering
           ============================================ */
        .ProseMirror {
          outline: none;
          min-height: 100px;
          line-height: 1.75;
          font-size: 16px;
          color: #1a1a1a;
        }

        .dark .ProseMirror {
          color: #e5e5e5;
        }

        /* === Placeholder === */
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        /* === Headings === */
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          line-height: 1.3;
          padding-bottom: 0.3em;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        .dark .ProseMirror h1 {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 1.4em;
          margin-bottom: 0.4em;
          line-height: 1.35;
          padding-bottom: 0.25em;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .dark .ProseMirror h2 {
          border-bottom-color: rgba(255, 255, 255, 0.05);
        }

        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1.2em;
          margin-bottom: 0.3em;
          line-height: 1.4;
        }

        .ProseMirror h4 {
          font-size: 1.1em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.25em;
        }

        .ProseMirror h1:first-child,
        .ProseMirror h2:first-child,
        .ProseMirror h3:first-child,
        .ProseMirror h4:first-child {
          margin-top: 0;
        }

        /* === Paragraphs === */
        .ProseMirror p {
          margin-top: 0;
          margin-bottom: 0.75em;
        }

        /* === Bold / Italic / Underline / Highlight === */
        .ProseMirror strong {
          font-weight: 700;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror u {
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .ProseMirror mark {
          background-color: #fff3bf;
          border-radius: 2px;
          padding: 1px 3px;
        }
        .dark .ProseMirror mark {
          background-color: rgba(255, 243, 191, 0.2);
          color: #ffd43b;
        }

        /* === Inline Code === */
        .ProseMirror code {
          background-color: rgba(0, 0, 0, 0.06);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 0.875em;
          font-family: "Fira Code", "JetBrains Mono", Menlo, Monaco, Consolas, monospace;
          color: #e83e8c;
        }
        .dark .ProseMirror code {
          background-color: rgba(255, 255, 255, 0.1);
          color: #f0a6ca;
        }

        /* === Code Block (with syntax highlighting) === */
        /* Light mode: atom-one-light style */
        .ProseMirror pre {
          background-color: #fafafa;
          color: #383a42;
          border-radius: 12px;
          padding: 1em 1.25em;
          margin: 1em 0;
          font-family: "Fira Code", "JetBrains Mono", Menlo, Monaco, Consolas, monospace;
          font-size: 0.875em;
          line-height: 1.6;
          overflow-x: auto;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        .ProseMirror pre code {
          background: none;
          padding: 0;
          border-radius: 0;
          color: inherit;
          font-size: inherit;
        }

        /* Light mode syntax tokens (atom-one-light) */
        .ProseMirror pre .hljs-keyword,
        .ProseMirror pre .hljs-selector-tag,
        .ProseMirror pre .hljs-built_in { color: #a626a4; }
        .ProseMirror pre .hljs-string,
        .ProseMirror pre .hljs-attr { color: #50a14f; }
        .ProseMirror pre .hljs-number,
        .ProseMirror pre .hljs-literal { color: #986801; }
        .ProseMirror pre .hljs-comment { color: #a0a1a7; font-style: italic; }
        .ProseMirror pre .hljs-function,
        .ProseMirror pre .hljs-title { color: #4078f2; }
        .ProseMirror pre .hljs-variable,
        .ProseMirror pre .hljs-params { color: #e45649; }
        .ProseMirror pre .hljs-type,
        .ProseMirror pre .hljs-class { color: #c18401; }
        .ProseMirror pre .hljs-meta { color: #4078f2; }
        .ProseMirror pre .hljs-tag { color: #e45649; }
        .ProseMirror pre .hljs-name { color: #e45649; }
        .ProseMirror pre .hljs-attribute { color: #986801; }

        /* Dark mode: atom-one-dark style */
        .dark .ProseMirror pre {
          background-color: #0d1117;
          color: #c9d1d9;
          border-color: rgba(255, 255, 255, 0.08);
        }
        .dark .ProseMirror pre .hljs-keyword,
        .dark .ProseMirror pre .hljs-selector-tag,
        .dark .ProseMirror pre .hljs-built_in { color: #c678dd; }
        .dark .ProseMirror pre .hljs-string,
        .dark .ProseMirror pre .hljs-attr { color: #98c379; }
        .dark .ProseMirror pre .hljs-number,
        .dark .ProseMirror pre .hljs-literal { color: #d19a66; }
        .dark .ProseMirror pre .hljs-comment { color: #5c6370; font-style: italic; }
        .dark .ProseMirror pre .hljs-function,
        .dark .ProseMirror pre .hljs-title { color: #61afef; }
        .dark .ProseMirror pre .hljs-variable,
        .dark .ProseMirror pre .hljs-params { color: #e06c75; }
        .dark .ProseMirror pre .hljs-type,
        .dark .ProseMirror pre .hljs-class { color: #e5c07b; }
        .dark .ProseMirror pre .hljs-meta { color: #56b6c2; }
        .dark .ProseMirror pre .hljs-tag { color: #e06c75; }
        .dark .ProseMirror pre .hljs-name { color: #e06c75; }
        .dark .ProseMirror pre .hljs-attribute { color: #d19a66; }

        /* === Blockquote === */
        .ProseMirror blockquote {
          border-left: 4px solid #6366f1;
          margin: 1em 0;
          padding: 0.6em 1em;
          background-color: rgba(99, 102, 241, 0.04);
          border-radius: 0 8px 8px 0;
          color: #444;
        }
        .dark .ProseMirror blockquote {
          border-left-color: #818cf8;
          background-color: rgba(129, 140, 248, 0.06);
          color: #bbb;
        }

        /* === Links === */
        .ProseMirror a {
          color: #6366f1;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.15s ease;
        }
        .ProseMirror a:hover {
          border-bottom-color: #6366f1;
        }
        .dark .ProseMirror a {
          color: #818cf8;
        }
        .dark .ProseMirror a:hover {
          border-bottom-color: #818cf8;
        }

        /* === Horizontal Rule === */
        .ProseMirror hr {
          border: none;
          height: 1px;
          margin: 2em 0;
          background: linear-gradient(to right, transparent, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.15) 80%, transparent);
        }
        .dark .ProseMirror hr {
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.1) 80%, transparent);
        }

        /* === Lists === */
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .ProseMirror li {
          margin: 0.25em 0;
        }

        .ProseMirror li p {
          margin: 0;
        }

        /* === Task List === */
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }

        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5em;
        }

        .ProseMirror ul[data-type="taskList"] li > label {
          flex-shrink: 0;
          margin-top: 0.25em;
        }

        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
        }

        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"]:checked {
          background-color: #6366f1;
          border-color: #6366f1;
        }

        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"]:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        .dark .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
          border-color: #4b5563;
        }

        .dark .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"]:checked {
          background-color: #818cf8;
          border-color: #818cf8;
        }

        .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div > p {
          text-decoration: line-through;
          color: #9ca3af;
        }

        /* === Table === */
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        .dark .ProseMirror table {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 0.5em 0.75em;
          min-width: 80px;
          text-align: left;
          vertical-align: top;
        }
        .dark .ProseMirror th,
        .dark .ProseMirror td {
          border-color: rgba(255, 255, 255, 0.08);
        }

        .ProseMirror th {
          background-color: rgba(0, 0, 0, 0.04);
          font-weight: 600;
          font-size: 0.9em;
          text-transform: none;
        }
        .dark .ProseMirror th {
          background-color: rgba(255, 255, 255, 0.06);
        }

        .ProseMirror tr:nth-child(even) td {
          background-color: rgba(0, 0, 0, 0.015);
        }
        .dark .ProseMirror tr:nth-child(even) td {
          background-color: rgba(255, 255, 255, 0.02);
        }

        .ProseMirror .selectedCell {
          background-color: rgba(99, 102, 241, 0.1);
        }

        /* Table column resize handle */
        .ProseMirror .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: #6366f1;
          pointer-events: none;
        }

        .ProseMirror.resize-cursor {
          cursor: col-resize;
        }

        /* === Images === */
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 0.75em 0;
          transition: box-shadow 0.2s ease;
        }
        .ProseMirror img:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .dark .ProseMirror img:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
          border-radius: 8px;
        }

        /* === Selection === */
        .ProseMirror ::selection {
          background-color: rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  )
}
