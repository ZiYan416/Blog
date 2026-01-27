"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { Toolbar } from './toolbar'

const lowlight = createLowlight(common)

interface EditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function Editor({ content, onChange, placeholder = '开始创作吧...' }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // 禁用默认的 codeBlock 以使用 lowlight 版本
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full h-auto border border-black/5 dark:border-white/5',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-neutral dark:prose-invert max-w-none min-h-[500px] focus:outline-none py-8 px-4 sm:px-8',
      },
    },
  })

  return (
    <div className="w-full border border-black/5 dark:border-white/5 bg-white dark:bg-neutral-900 rounded-[2rem] overflow-hidden transition-all focus-within:ring-1 ring-black/10 dark:ring-white/10 shadow-sm">
      <Toolbar editor={editor} />
      <div className="relative">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
