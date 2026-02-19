"use client"

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Typography } from '@tiptap/extension-typography'
import { common, createLowlight } from 'lowlight'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { useToast } from '@/hooks/use-toast'

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

interface RichEditorProps {
  content: string
  onChange: (content: string) => void
  onEditorReady: (editor: Editor) => void
  placeholder?: string
  className?: string
}

export function RichEditor({ content, onChange, onEditorReady, placeholder, className }: RichEditorProps) {
  const isInternalUpdate = useRef(false)
  const { toast } = useToast()

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
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
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4]
        },
        // Disable the default codeBlock since we use CodeBlockLowlight
        codeBlock: false,
      }),
      // Markdown bidirectional conversion
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      // Code block with syntax highlighting
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
        HTMLAttributes: {
          class: 'hljs',
        },
      }),
      // Typography: smart punctuation auto-replacement
      Typography,
      // Image support
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      // Link support
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      // Placeholder
      Placeholder.configure({
        placeholder: placeholder || '写点什么...',
      }),
      // Table support
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      // Task list (checkbox)
      TaskList.configure({
        HTMLAttributes: {
          class: 'editor-task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
      }),
      // Highlight
      Highlight.configure({
        multicolor: false,
      }),
      // Underline
      Underline,
      // Text alignment
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    editorProps: {
      attributes: {
        class: className || 'prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[150px]',
        spellcheck: 'false',
      },
      handlePaste: (view, event, _slice) => {
        const items = Array.from(event.clipboardData?.items || [])
        const imageItem = items.find(item => item.type.startsWith('image'))

        if (imageItem) {
          event.preventDefault()
          const file = imageItem.getAsFile()
          if (file) {
            handleImageUpload(file).then(url => {
              if (url) {
                view.dispatch(view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src: url })
                ))
              }
            })
          }
          return true
        }
        return false
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image')) {
            event.preventDefault()
            handleImageUpload(file).then(url => {
              if (url) {
                const { schema } = view.state
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
                if (coordinates) {
                  view.dispatch(view.state.tr.insert(coordinates.pos, schema.nodes.image.create({ src: url })))
                }
              }
            })
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true
      const markdown = (editor.storage as any).markdown.getMarkdown()
      onChange(markdown)
      // Reset flag after render cycle
      setTimeout(() => {
        isInternalUpdate.current = false
      }, 0)
    },
    onCreate: ({ editor }) => {
      onEditorReady(editor)
      if (content) {
        editor.commands.setContent(content)
      }
    },
    immediatelyRender: false, // Fix hydration mismatch
  })

  // Sync external content changes (e.g. from Source mode)
  useEffect(() => {
    if (!editor) return
    if (isInternalUpdate.current) return

    const currentContent = (editor.storage as any).markdown.getMarkdown()
    if (content !== currentContent) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return <EditorContent editor={editor} className="h-full" />
}
