"use client"

import { useCallback, useEffect, useRef } from "react"
import CodeEditor from "react-simple-code-editor"
import { highlight, languages } from "prismjs"
import "prismjs/components/prism-markdown"
import { v4 as uuidv4 } from "uuid"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { getErrorMessage } from "@/lib/errors"

export function SourceMarkdownEditor({
  content,
  onChange,
  containerRef,
}: {
  content: string
  onChange: (content: string) => void
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const { toast } = useToast()
  const contentRef = useRef(content)

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

  const uploadImage = useCallback(
    async (file: File) => {
      try {
        const supabase = createClient()
        const extension = file.name.split(".").pop()
        const filePath = `${uuidv4()}.${extension}`
        const { error } = await supabase.storage
          .from("blog-images")
          .upload(filePath, file)
        if (error) throw error
        return supabase.storage.from("blog-images").getPublicUrl(filePath).data
          .publicUrl
      } catch (error) {
        toast({
          title: "图片上传失败",
          description: getErrorMessage(error, "图片上传失败"),
          variant: "destructive",
        })
        return null
      }
    },
    [toast]
  )

  const handlePaste = useCallback(
    async (event: React.ClipboardEvent) => {
      const imageItem = Array.from(event.clipboardData.items).find((item) =>
        item.type.startsWith("image")
      )
      const file = imageItem?.getAsFile()
      if (!file) return

      event.preventDefault()
      const textarea = containerRef.current?.querySelector("textarea")
      if (!textarea) return
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const marker = `![Uploading ${file.name}...]()`
      const pending =
        contentRef.current.substring(0, start) +
        marker +
        contentRef.current.substring(end)
      onChange(pending)

      const url = await uploadImage(file)
      const replacement = url ? `![image](${url})` : ""
      onChange(pending.replace(marker, replacement))
      window.requestAnimationFrame(() => {
        const current = containerRef.current?.querySelector("textarea")
        const cursor = start + replacement.length
        current?.focus()
        current?.setSelectionRange(cursor, cursor)
      })
    },
    [containerRef, onChange, uploadImage]
  )

  return (
    <div
      ref={containerRef}
      className="source-markdown-editor min-h-full p-3 sm:p-4 md:p-6"
    >
      <CodeEditor
        value={content}
        onValueChange={onChange}
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
      />
    </div>
  )
}
