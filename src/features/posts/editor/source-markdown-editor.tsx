"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import CodeEditor from "react-simple-code-editor"
import { highlight, languages } from "prismjs"
import "prismjs/components/prism-markdown"
import { useToast } from "@/hooks/use-toast"
import {
  getImageAltText,
  uploadBlogImages,
} from "@/features/posts/image-upload"
import {
  SourceEditorContextMenu,
  type EditorContextMenuPosition,
  type EditorMenuGroup,
} from "@/features/posts/editor/editor-context-menu"
import type { MarkdownAction } from "@/features/posts/editor/toolbar"
import { insertMarkdownBlocks } from "@/features/posts/markdown-normalization"

export function SourceMarkdownEditor({
  content,
  onChange,
  containerRef,
  articlePublicId,
  onUploadStateChange,
  onAction,
}: {
  content: string
  onChange: (content: string) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  articlePublicId?: number
  onUploadStateChange?: (uploading: boolean) => void
  onAction: (action: MarkdownAction) => void
}) {
  const { toast } = useToast()
  const contentRef = useRef(content)
  const pendingUploads = useRef(0)
  const [dragActive, setDragActive] = useState(false)
  const [contextMenu, setContextMenu] =
    useState<EditorContextMenuPosition | null>(null)

  useEffect(() => {
    contentRef.current = content
  }, [content])

  useEffect(() => {
    void import("prismjs/components/prism-javascript")
    void import("prismjs/components/prism-typescript")
    void import("prismjs/components/prism-css")
    void import("prismjs/components/prism-json")
    void import("prismjs/components/prism-bash")
  }, [])

  const updateContent = useCallback(
    (nextContent: string) => {
      contentRef.current = nextContent
      onChange(nextContent)
    },
    [onChange]
  )

  const handleImageFiles = useCallback(
    async (files: File[], selection?: { start: number; end: number }) => {
      if (files.length === 0) return
      const textarea = containerRef.current?.querySelector("textarea")
      if (!textarea) return

      const start = selection?.start ?? textarea.selectionStart
      const end = selection?.end ?? textarea.selectionEnd
      const markers = files.map(
        (_, index) =>
          `![图片上传中…… ${crypto.randomUUID()}-${index}]()`
      )
      const insertion = insertMarkdownBlocks(
        contentRef.current,
        start,
        end,
        markers
      )
      updateContent(insertion.content)

      pendingUploads.current += 1
      onUploadStateChange?.(true)
      try {
        const results = await uploadBlogImages(files, {
          articlePublicId,
        })
        let nextContent = contentRef.current
        let insertedLength = 0

        results.forEach((result, index) => {
          const replacement = result.url
            ? `![${getImageAltText(result.file)}](${result.url})`
            : ""
          insertedLength += replacement.length
          nextContent = nextContent.replace(markers[index], replacement)
        })
        updateContent(nextContent)

        const failed = results.filter((result) => !result.url)
        if (failed.length > 0) {
          toast({
            title: failed.length === results.length
              ? "图片上传失败"
              : "部分图片上传失败",
            description:
              failed[0].error?.message ||
              `${failed.length} 张图片上传失败，请稍后重试`,
            variant: "destructive",
          })
        }

        window.requestAnimationFrame(() => {
          const current = containerRef.current?.querySelector("textarea")
          if (
            !current ||
            document.activeElement !== current ||
            current.selectionStart !== start ||
            current.selectionEnd !== start
          ) {
            return
          }
          const cursor =
            insertion.blockStart +
            insertedLength +
            Math.max(0, results.length - 1) * 2
          current.setSelectionRange(cursor, cursor)
        })
      } finally {
        pendingUploads.current = Math.max(0, pendingUploads.current - 1)
        onUploadStateChange?.(pendingUploads.current > 0)
      }
    },
    [
      articlePublicId,
      containerRef,
      onUploadStateChange,
      toast,
      updateContent,
    ]
  )

  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      const files = Array.from(event.clipboardData.items)
        .filter((item) => item.type.startsWith("image"))
        .flatMap((item) => {
          const file = item.getAsFile()
          return file ? [file] : []
        })
      if (files.length === 0) return

      event.preventDefault()
      void handleImageFiles(files)
    },
    [handleImageFiles]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      const files = Array.from(event.dataTransfer.files).filter((file) =>
        file.type.startsWith("image")
      )
      setDragActive(false)
      if (files.length === 0) return

      event.preventDefault()
      void handleImageFiles(files)
    },
    [handleImageFiles]
  )

  const withTextarea = useCallback(
    <Result,>(operation: (textarea: HTMLTextAreaElement) => Result) => {
      const textarea = containerRef.current?.querySelector("textarea")
      if (!textarea) return
      return operation(textarea)
    },
    [containerRef]
  )

  const replaceSelection = useCallback(
    (textarea: HTMLTextAreaElement, replacement: string) => {
      const start = textarea.selectionStart
      const nextContent =
        contentRef.current.slice(0, start) +
        replacement +
        contentRef.current.slice(textarea.selectionEnd)
      updateContent(nextContent)
      window.requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(
          start + replacement.length,
          start + replacement.length
        )
      })
    },
    [updateContent]
  )

  const sourceMenuGroups: EditorMenuGroup[] = [
    {
      actions: [
        {
          label: "撤销",
          shortcut: "Ctrl+Z",
          run: () =>
            withTextarea((textarea) => {
              textarea.focus()
              document.execCommand("undo")
            }),
        },
        {
          label: "重做",
          shortcut: "Ctrl+Y",
          run: () =>
            withTextarea((textarea) => {
              textarea.focus()
              document.execCommand("redo")
            }),
        },
      ],
    },
    {
      actions: [
        {
          label: "剪切",
          shortcut: "Ctrl+X",
          run: async () => {
            try {
              await withTextarea(async (textarea) => {
                const selected = textarea.value.slice(
                  textarea.selectionStart,
                  textarea.selectionEnd
                )
                await navigator.clipboard.writeText(selected)
                replaceSelection(textarea, "")
              })
            } catch {
              toast({
                title: "剪贴板操作失败",
                description: "无法访问剪贴板，请检查浏览器权限",
                variant: "destructive",
              })
            }
          },
        },
        {
          label: "复制",
          shortcut: "Ctrl+C",
          run: async () => {
            try {
              await withTextarea((textarea) =>
                navigator.clipboard.writeText(
                  textarea.value.slice(
                    textarea.selectionStart,
                    textarea.selectionEnd
                  )
                )
              )
            } catch {
              toast({
                title: "剪贴板操作失败",
                description: "无法访问剪贴板，请检查浏览器权限",
                variant: "destructive",
              })
            }
          },
        },
        {
          label: "粘贴",
          shortcut: "Ctrl+V",
          run: async () => {
            try {
              const text = await navigator.clipboard.readText()
              withTextarea((textarea) => replaceSelection(textarea, text))
            } catch {
              toast({
                title: "剪贴板操作失败",
                description: "浏览器未允许读取剪贴板，请使用 Ctrl+V",
                variant: "destructive",
              })
            }
          },
        },
        {
          label: "全选",
          shortcut: "Ctrl+A",
          run: () =>
            withTextarea((textarea) => {
              textarea.focus()
              textarea.select()
            }),
        },
      ],
    },
    {
      label: "Markdown 格式",
      actions: [
        { label: "一级标题", run: () => onAction("h1") },
        { label: "二级标题", run: () => onAction("h2") },
        { label: "三级标题", run: () => onAction("h3") },
        { label: "加粗", shortcut: "Ctrl+B", run: () => onAction("bold") },
        { label: "斜体", shortcut: "Ctrl+I", run: () => onAction("italic") },
        { label: "行内代码", shortcut: "Ctrl+E", run: () => onAction("code") },
        { label: "无序列表", run: () => onAction("list") },
        { label: "有序列表", run: () => onAction("ordered-list") },
        { label: "引用", run: () => onAction("quote") },
      ],
    },
    {
      label: "插入",
      actions: [
        { label: "链接", shortcut: "Ctrl+K", run: () => onAction("link") },
        { label: "图片", run: () => onAction("image") },
        { label: "表格", run: () => onAction("table") },
        { label: "分割线", run: () => onAction("hr") },
      ],
    },
  ]

  return (
    <div
      ref={containerRef}
      className={`source-markdown-editor relative min-h-full p-3 sm:p-4 md:p-6 ${
        dragActive ? "bg-blue-50/80 dark:bg-blue-950/20" : ""
      }`}
      onDragEnter={(event) => {
        if (Array.from(event.dataTransfer.items).some((item) =>
          item.type.startsWith("image")
        )) {
          event.preventDefault()
          setDragActive(true)
        }
      }}
      onDragOver={(event) => {
        if (dragActive) event.preventDefault()
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDragActive(false)
        }
      }}
      onDrop={handleDrop}
    >
      {dragActive ? (
        <div className="pointer-events-none absolute inset-3 z-20 flex items-center justify-center rounded-xl border-2 border-dashed border-blue-400 bg-white/80 text-sm font-medium text-blue-600 backdrop-blur-sm dark:bg-neutral-950/80 dark:text-blue-300">
          松开以上传图片
        </div>
      ) : null}
      <CodeEditor
        value={content}
        onValueChange={updateContent}
        highlight={(code) => highlight(code, languages.markdown, "markdown")}
        padding={10}
        placeholder="Source Mode..."
        className="font-mono text-base leading-relaxed bg-transparent min-h-full focus:outline-none text-neutral-600 dark:text-neutral-400"
        style={{
          fontFamily:
            '"Fira Code", "JetBrains Mono", Menlo, Monaco, Consolas, monospace',
          fontSize: 14,
          backgroundColor: "transparent",
        }}
        textareaClassName="focus:outline-none"
        onPaste={handlePaste}
        onContextMenu={(event) => {
          event.preventDefault()
          setContextMenu({ x: event.clientX, y: event.clientY })
        }}
      />
      {contextMenu ? (
        <SourceEditorContextMenu
          groups={sourceMenuGroups}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
        />
      ) : null}
    </div>
  )
}
