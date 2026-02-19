"use client"

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Image as ImageIcon,
  Terminal,
  Eye,
  Pencil,
  Columns,
  Link as LinkIcon,
  Settings,
  Table as TableIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ViewMode = 'source' | 'rich' | 'split'
export type MarkdownAction =
  | 'bold' | 'italic' | 'underline' | 'highlight'
  | 'h1' | 'h2' | 'h3'
  | 'list' | 'ordered-list' | 'task-list'
  | 'quote' | 'code' | 'code-block'
  | 'image' | 'link'
  | 'table' | 'hr'
  | 'align-left' | 'align-center' | 'align-right'

interface ToolbarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onAction: (action: MarkdownAction) => void
  editor: Editor | null
}

interface ToolbarItem {
  icon: any
  title: string
  shortcut?: string
  action: MarkdownAction
  isActive?: (editor: Editor) => boolean
}

const textFormatItems: ToolbarItem[] = [
  {
    icon: Bold,
    title: '加粗',
    shortcut: 'Ctrl+B',
    action: 'bold',
    isActive: (editor) => editor.isActive('bold'),
  },
  {
    icon: Italic,
    title: '斜体',
    shortcut: 'Ctrl+I',
    action: 'italic',
    isActive: (editor) => editor.isActive('italic'),
  },
  {
    icon: UnderlineIcon,
    title: '下划线',
    shortcut: 'Ctrl+U',
    action: 'underline',
    isActive: (editor) => editor.isActive('underline'),
  },
  {
    icon: Highlighter,
    title: '高亮',
    shortcut: 'Ctrl+Shift+H',
    action: 'highlight',
    isActive: (editor) => editor.isActive('highlight'),
  },
  {
    icon: Code,
    title: '行内代码',
    shortcut: 'Ctrl+E',
    action: 'code',
    isActive: (editor) => editor.isActive('code'),
  },
]

const paragraphItems: ToolbarItem[] = [
  {
    icon: Heading1,
    title: '一级标题',
    shortcut: 'Ctrl+Alt+1',
    action: 'h1',
    isActive: (editor) => editor.isActive('heading', { level: 1 }),
  },
  {
    icon: Heading2,
    title: '二级标题',
    shortcut: 'Ctrl+Alt+2',
    action: 'h2',
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
  },
  {
    icon: Heading3,
    title: '三级标题',
    shortcut: 'Ctrl+Alt+3',
    action: 'h3',
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
  },
  {
    icon: List,
    title: '无序列表',
    shortcut: 'Ctrl+Shift+8',
    action: 'list',
    isActive: (editor) => editor.isActive('bulletList'),
  },
  {
    icon: ListOrdered,
    title: '有序列表',
    shortcut: 'Ctrl+Shift+7',
    action: 'ordered-list',
    isActive: (editor) => editor.isActive('orderedList'),
  },
  {
    icon: ListTodo,
    title: '任务列表',
    action: 'task-list',
    isActive: (editor) => editor.isActive('taskList'),
  },
  {
    icon: Quote,
    title: '引用',
    shortcut: 'Ctrl+Shift+B',
    action: 'quote',
    isActive: (editor) => editor.isActive('blockquote'),
  },
  {
    icon: Terminal,
    title: '代码块',
    shortcut: 'Ctrl+Alt+C',
    action: 'code-block',
    isActive: (editor) => editor.isActive('codeBlock'),
  },
]

const insertItems: ToolbarItem[] = [
  {
    icon: LinkIcon,
    title: '插入链接',
    shortcut: 'Ctrl+K',
    action: 'link',
    isActive: (editor) => editor.isActive('link'),
  },
  {
    icon: ImageIcon,
    title: '插入图片',
    action: 'image',
  },
  {
    icon: TableIcon,
    title: '插入表格',
    action: 'table',
  },
  {
    icon: Minus,
    title: '分割线',
    action: 'hr',
  },
]

const alignItems: ToolbarItem[] = [
  {
    icon: AlignLeft,
    title: '左对齐',
    action: 'align-left',
    isActive: (editor) => editor.isActive({ textAlign: 'left' }),
  },
  {
    icon: AlignCenter,
    title: '居中',
    action: 'align-center',
    isActive: (editor) => editor.isActive({ textAlign: 'center' }),
  },
  {
    icon: AlignRight,
    title: '右对齐',
    action: 'align-right',
    isActive: (editor) => editor.isActive({ textAlign: 'right' }),
  },
]

function ToolbarGroup({ items, editor, onAction }: { items: ToolbarItem[], editor: Editor | null, onAction: (action: MarkdownAction) => void }) {
  return (
    <>
      {items.map((item, index) => {
        const isActive = editor && !editor.isDestroyed && item.isActive ? item.isActive(editor) : false
        const tooltip = item.shortcut ? `${item.title} (${item.shortcut})` : item.title

        return (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 md:h-8 md:w-8 rounded-lg transition-all duration-150 flex-shrink-0",
              isActive
                ? "bg-black/10 dark:bg-white/15 text-black dark:text-white shadow-sm"
                : "text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-neutral-800 dark:hover:text-neutral-200"
            )}
            onClick={() => onAction(item.action)}
            title={tooltip}
          >
            <item.icon className="h-4 w-4" />
          </Button>
        )
      })}
    </>
  )
}

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-black/8 dark:bg-white/8 mx-0.5 flex-shrink-0" />
}

export function Toolbar({ viewMode, onViewModeChange, onAction, editor }: ToolbarProps) {
  const [showAdvancedMode, setShowAdvancedMode] = useState(false)

  return (
    <div className="flex items-center gap-0.5 p-2 md:p-2 border-b border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-md overflow-x-auto">
      {/* 桌面端视图模式切换 */}
      <div className="hidden md:flex items-center gap-1 border-r border-black/10 dark:border-white/10 pr-2 mr-1 flex-shrink-0">
        {viewMode !== 'split' && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg transition-colors",
              "text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5"
            )}
            onClick={() => onViewModeChange(viewMode === 'source' ? 'rich' : 'source')}
            title={viewMode === 'source' ? "切换到所见即所得" : "切换到源码模式"}
          >
            {viewMode === 'source' ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-lg transition-colors",
            viewMode === 'split'
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5"
          )}
          onClick={() => onViewModeChange(viewMode === 'split' ? 'source' : 'split')}
          title={viewMode === 'split' ? "退出分栏" : "分栏编辑"}
        >
          <Columns className="h-4 w-4" />
        </Button>
      </div>

      {/* 移动端高级模式切换 */}
      <div className="md:hidden flex items-center border-r border-black/10 dark:border-white/10 pr-2 mr-1 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5"
              title="编辑器设置"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>编辑器模式</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setShowAdvancedMode(false)
                onViewModeChange('rich')
              }}
              className={viewMode === 'rich' && !showAdvancedMode ? "bg-black/5 dark:bg-white/5" : ""}
            >
              <Eye className="w-4 h-4 mr-2" />
              富文本模式（推荐）
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setShowAdvancedMode(true)
                onViewModeChange('source')
              }}
              className={viewMode === 'source' && showAdvancedMode ? "bg-black/5 dark:bg-white/5" : ""}
            >
              <Code className="w-4 h-4 mr-2" />
              源码模式（高级）
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 工具栏按钮 - 分组 */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {/* 文本格式组 */}
        <ToolbarGroup items={textFormatItems} editor={editor} onAction={onAction} />
        <ToolbarSeparator />
        {/* 段落格式组 */}
        <ToolbarGroup items={paragraphItems} editor={editor} onAction={onAction} />
        <ToolbarSeparator />
        {/* 对齐组 */}
        <ToolbarGroup items={alignItems} editor={editor} onAction={onAction} />
        <ToolbarSeparator />
        {/* 插入组 */}
        <ToolbarGroup items={insertItems} editor={editor} onAction={onAction} />
      </div>
    </div>
  )
}
