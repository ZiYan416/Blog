"use client"

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
  Terminal,
  Eye,
  Pencil,
  Columns,
  Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ViewMode = 'source' | 'rich' | 'split'
export type MarkdownAction = 'bold' | 'italic' | 'h1' | 'h2' | 'list' | 'ordered-list' | 'quote' | 'code' | 'code-block' | 'image' | 'link'

interface ToolbarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onAction: (action: MarkdownAction) => void
}

export function Toolbar({ viewMode, onViewModeChange, onAction }: ToolbarProps) {
  const items = [
    {
      icon: Bold,
      title: '加粗',
      action: () => onAction('bold'),
    },
    {
      icon: Italic,
      title: '斜体',
      action: () => onAction('italic'),
    },
    {
      icon: Heading1,
      title: '一级标题',
      action: () => onAction('h1'),
    },
    {
      icon: Heading2,
      title: '二级标题',
      action: () => onAction('h2'),
    },
    {
      icon: List,
      title: '无序列表',
      action: () => onAction('list'),
    },
    {
      icon: ListOrdered,
      title: '有序列表',
      action: () => onAction('ordered-list'),
    },
    {
      icon: Quote,
      title: '引用',
      action: () => onAction('quote'),
    },
    {
      icon: Code,
      title: '行内代码',
      action: () => onAction('code'),
    },
    {
      icon: Terminal,
      title: '代码块',
      action: () => onAction('code-block'),
    },
    {
      icon: LinkIcon,
      title: '插入链接',
      action: () => onAction('link'),
    },
    {
      icon: ImageIcon,
      title: '插入图片',
      action: () => onAction('image'),
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-md">
      <div className="flex items-center gap-1 border-r border-black/10 dark:border-white/10 pr-2 mr-2">
        {/* Mode Switcher Logic:
            If in Split mode, button can switch back to Source or Rich (Single).
            If in Single mode, button toggles between Source/Rich or switches to Split.
        */}

        {/* Toggle Single Mode Type (Source <-> Rich) */}
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

        {/* Split Mode Toggle */}
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

      <div className="flex items-center gap-1">
        {items.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            onClick={item.action}
            title={item.title}
          >
            <item.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  )
}
