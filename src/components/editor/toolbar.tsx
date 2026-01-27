"use client"

import { type Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Code,
  Image as ImageIcon,
  Undo,
  Redo,
  Terminal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  editor: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  const addImage = () => {
    const url = window.prompt('请输入图片 URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const items = [
    {
      icon: Bold,
      title: '加粗',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: Italic,
      title: '斜体',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: Heading1,
      title: '一级标题',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      icon: Heading2,
      title: '二级标题',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      icon: List,
      title: '无序列表',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      title: '有序列表',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      icon: Quote,
      title: '引用',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      icon: Code,
      title: '行内代码',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive('code'),
    },
    {
      icon: Terminal,
      title: '代码块',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
    },
    {
      icon: ImageIcon,
      title: '插入图片',
      action: addImage,
      isActive: () => false,
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-md">
      {items.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-lg transition-colors",
            item.isActive()
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5"
          )}
          onClick={item.action}
          title={item.title}
        >
          <item.icon className="h-4 w-4" />
        </Button>
      ))}
      <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg text-neutral-500"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg text-neutral-500"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}
