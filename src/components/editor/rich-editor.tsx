"use client"

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { useToast } from '@/hooks/use-toast'

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
          levels: [1, 2, 3]
        },
        codeBlock: {
            HTMLAttributes: {
                class: 'bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg font-mono text-sm'
            }
        }
      }),
      Markdown.configure({
          html: false, // Force markdown output
          transformPastedText: true,
          transformCopiedText: true
      }),
      Image,
      Link.configure({
        openOnClick: false
      }),
      Placeholder.configure({
        placeholder: placeholder || '写点什么...'
      })
    ],
    editorProps: {
      attributes: {
        class: className || 'prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[150px]'
      },
      handlePaste: (view, event, slice) => {
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
      handleDrop: (view, event, slice, moved) => {
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
      }
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
    immediatelyRender: false // Fix hydration mismatch
  })

  // Sync external content changes (e.g. from Source mode)
  useEffect(() => {
    if (!editor) return

    // If the editor is focused, we assume the user is typing here,
    // so we don't need to sync back (unless we want to support collaborative editing later).
    // However, if we are in Split mode and typing in Source, we need to sync.
    // So check if the update originated internally.
    if (isInternalUpdate.current) return

    const currentContent = (editor.storage as any).markdown.getMarkdown()
    if (content !== currentContent) {
       // Save cursor position? Tiptap might handle setContent gracefully if keys match?
       // Unfortunately setContent usually resets selection.
       // If we are not focused, it doesn't matter much.
       editor.commands.setContent(content)
    }
  }, [content, editor])

  return <EditorContent editor={editor} className="h-full" />
}
