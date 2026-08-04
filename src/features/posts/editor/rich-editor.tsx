"use client"

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import Image from '@tiptap/extension-image'
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
import { Typography } from '@tiptap/extension-typography'
import { common, createLowlight } from 'lowlight'
import powershell from 'highlight.js/lib/languages/powershell'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { ArticleCodeBlock } from './article-code-block-extension'
import { ArticleLink } from './article-link-extension'
import {
  EditorContextMenu,
  type EditorContextMenuPosition,
} from './editor-context-menu'
import type { MarkdownStorage } from 'tiptap-markdown'
import {
  getImageAltText,
  uploadBlogImages,
} from '@/features/posts/image-upload'
import type { EditorView } from '@tiptap/pm/view'
import { TextSelection } from '@tiptap/pm/state'
import { CellSelection } from '@tiptap/pm/tables'
import { normalizeMarkdownBlockBoundaries } from '@/features/posts/markdown-normalization'

// Create lowlight instance with common languages
const lowlight = createLowlight(common)
lowlight.register('powershell', powershell)
lowlight.registerAlias('powershell', ['pwsh', 'ps1'])

function getMarkdown(editor: Editor) {
  return normalizeMarkdownBlockBoundaries(
    (editor.storage as unknown as { markdown: MarkdownStorage }).markdown.getMarkdown()
  )
}

interface RichEditorProps {
  content: string
  onChange: (content: string) => void
  onEditorReady: (editor: Editor) => void
  articlePublicId?: number
  onUploadStateChange?: (uploading: boolean) => void
  placeholder?: string
  className?: string
}

export function RichEditor({
  content,
  onChange,
  onEditorReady,
  articlePublicId,
  onUploadStateChange,
  placeholder,
  className,
}: RichEditorProps) {
  const isInternalUpdate = useRef(false)
  const lastInternalContent = useRef('')
  const pendingUploads = useRef(0)
  const [contextMenu, setContextMenu] =
    useState<EditorContextMenuPosition | null>(null)
  const { toast } = useToast()
  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const handleImageFiles = async (
    view: EditorView,
    files: File[],
    position: number
  ) => {
    pendingUploads.current += 1
    onUploadStateChange?.(true)

    try {
      const results = await uploadBlogImages(files, {
        articlePublicId,
      })
      const successful = results.filter(
        (result): result is typeof result & { url: string } =>
          typeof result.url === 'string'
      )

      if (successful.length > 0 && view.dom.isConnected) {
        let transaction = view.state.tr
        let insertionPosition = Math.min(position, transaction.doc.content.size)

        for (const result of successful) {
          const node = view.state.schema.nodes.image.create({
            src: result.url,
            alt: getImageAltText(result.file),
          })
          transaction = transaction.insert(insertionPosition, node)
          insertionPosition += node.nodeSize
        }
        view.dispatch(transaction)
      }

      const failed = results.filter((result) => !result.url)
      if (failed.length > 0) {
        toast({
          title: successful.length > 0 ? "部分图片上传失败" : "图片上传失败",
          description:
            failed[0].error?.message ||
            `${failed.length} 张图片上传失败，请稍后重试`,
          variant: "destructive",
        })
      }
    } finally {
      pendingUploads.current = Math.max(0, pendingUploads.current - 1)
      onUploadStateChange?.(pendingUploads.current > 0)
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
        // These are configured separately below.
        link: false,
        underline: false,
      }),
      // Markdown bidirectional conversion
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      // Code block with syntax highlighting
      ArticleCodeBlock.configure({
        lowlight,
        defaultLanguage: null,
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
      ArticleLink.configure({
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
      handlePaste: (view, event) => {
        const files = Array.from(event.clipboardData?.items || [])
          .filter((item) => item.type.startsWith('image'))
          .flatMap((item) => {
            const file = item.getAsFile()
            return file ? [file] : []
          })
        if (files.length === 0) return false

        event.preventDefault()
        void handleImageFiles(view, files, view.state.selection.from)
        return true
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer) return false
        const files = Array.from(event.dataTransfer.files).filter((file) =>
          file.type.startsWith('image')
        )
        if (files.length === 0) return false

        event.preventDefault()
        const coordinates = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })
        void handleImageFiles(
          view,
          files,
          coordinates?.pos || view.state.selection.from
        )
        return true
      },
      handleDOMEvents: {
        contextmenu: (view, event) => {
          if (!(event instanceof MouseEvent)) return false

          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          })
          if (!coordinates) return false

          const position = view.state.doc.resolve(coordinates.pos)
          const currentSelection = view.state.selection
          const clickedSelectedCells =
            currentSelection instanceof CellSelection &&
            coordinates.pos >= currentSelection.from &&
            coordinates.pos <= currentSelection.to
          const clickedTextSelection =
            !currentSelection.empty &&
            coordinates.pos >= currentSelection.from &&
            coordinates.pos <= currentSelection.to
          if (!clickedSelectedCells && !clickedTextSelection) {
            view.dispatch(
              view.state.tr.setSelection(TextSelection.near(position))
            )
          }
          event.preventDefault()
          setContextMenu({
            x: event.clientX,
            y: event.clientY,
          })
          return true
        },
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true
      const markdown = getMarkdown(editor)
      lastInternalContent.current = markdown
      onChange(markdown)
      // Reset flag after render cycle using queueMicrotask for more reliable timing
      queueMicrotask(() => {
        isInternalUpdate.current = false
      })
    },
    onCreate: ({ editor }) => {
      onEditorReady(editor)
      if (content) {
        editor.commands.setContent(normalizeMarkdownBlockBoundaries(content))
      }
    },
    immediatelyRender: false, // Fix hydration mismatch
  })

  // Sync external content changes (e.g. from Source mode)
  useEffect(() => {
    if (!editor) return
    if (isInternalUpdate.current) return
    // Skip if this content was just produced internally by the editor
    if (content === lastInternalContent.current) return

    const normalizedContent = normalizeMarkdownBlockBoundaries(content)
    const currentContent = getMarkdown(editor)
    if (normalizedContent !== currentContent) {
      // Save cursor position before resetting content
      const { from, to } = editor.state.selection
      editor.commands.setContent(normalizedContent, { emitUpdate: false })
      // Restore cursor position (clamped to new doc length)
      try {
        const maxPos = editor.state.doc.content.size
        const safeFrom = Math.min(from, maxPos)
        const safeTo = Math.min(to, maxPos)
        editor.commands.setTextSelection({ from: safeFrom, to: safeTo })
      } catch {
        // If restoration fails, leave cursor where setContent placed it
      }
    }
  }, [content, editor])

  return (
    <>
      <EditorContent editor={editor} className="h-full" />
      {editor && contextMenu ? (
        <EditorContextMenu
          editor={editor}
          position={contextMenu}
          onClose={closeContextMenu}
          onClipboardError={(message) =>
            toast({
              title: "剪贴板操作失败",
              description: message,
              variant: "destructive",
            })
          }
        />
      ) : null}
    </>
  )
}
