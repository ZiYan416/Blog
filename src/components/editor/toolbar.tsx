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
  Link as LinkIcon,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ViewMode = 'source' | 'rich' | 'split'
export type MarkdownAction = 'bold' | 'italic' | 'h1' | 'h2' | 'list' | 'ordered-list' | 'quote' | 'code' | 'code-block' | 'image' | 'link'

interface ToolbarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onAction: (action: MarkdownAction) => void
}

export function Toolbar({ viewMode, onViewModeChange, onAction }: ToolbarProps) {
  const [showAdvancedMode, setShowAdvancedMode] = useState(false)
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
    <div className="flex items-center gap-1 p-2 md:p-2 border-b border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-800/50 sticky top-0 z-10 backdrop-blur-md overflow-x-auto">
      {/* 桌面端视图模式切换 */}
      <div className="hidden md:flex items-center gap-1 border-r border-black/10 dark:border-white/10 pr-2 mr-2 flex-shrink-0">
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

      {/* 移动端高级模式切换（下拉菜单） */}
      <div className="md:hidden flex items-center border-r border-black/10 dark:border-white/10 pr-2 mr-2 flex-shrink-0">
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

      {/* 工具栏按钮 - 移动端横向滚动 */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {items.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:h-8 md:w-8 rounded-lg text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex-shrink-0"
            onClick={item.action}
            title={item.title}
          >
            <item.icon className="h-4 w-4 md:h-4 md:w-4" />
          </Button>
        ))}
      </div>
    </div>
  )
}
