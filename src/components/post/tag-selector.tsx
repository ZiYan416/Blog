
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Plus, Tag as TagIcon, Loader2, RefreshCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TagSelectorProps {
  value: string[]
  onChange: (tags: string[]) => void
  availableTags: string[]
  loading?: boolean
  onRefresh?: () => void
}

export function TagSelector({ value, onChange, availableTags, loading = false, onRefresh }: TagSelectorProps) {
  const [newTagInput, setNewTagInput] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const toggleTag = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter(t => t !== tag))
    } else {
      onChange([...value, tag])
    }
  }

  const addNewTag = () => {
    if (!newTagInput.trim()) return
    const tag = newTagInput.trim()
    if (!value.includes(tag)) {
      onChange([...value, tag])
    }
    setNewTagInput('')
    setIsAdding(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <TagIcon className="w-4 h-4" />
          标签管理
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onRefresh}
          title="刷新标签列表"
        >
          <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Selected Tags Area */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-black/5 dark:border-white/5">
        {value.length > 0 ? (
          value.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="pl-2 pr-1 py-1 gap-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              {tag}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleTag(tag)
                }}
                className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-xs text-neutral-400 self-center">
            暂未选择标签
          </span>
        )}
      </div>

      {/* Available Tags Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
          <span>现有标签库</span>
          <span className="opacity-50">{availableTags.length} 个</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin opacity-50" />
          </div>
        ) : (
          <ScrollArea className="h-[120px] w-full rounded-xl border border-black/5 dark:border-white/5 p-2">
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const isSelected = value.includes(tag)
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`
                      text-xs px-2 py-1 rounded-md transition-all border
                      ${isSelected
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-700'}
                    `}
                  >
                    {tag}
                  </button>
                )
              })}
              {availableTags.length === 0 && (
                <div className="w-full text-center py-4 text-xs text-neutral-400">
                  暂无现有标签
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Add New Tag Input */}
      {isAdding ? (
        <div className="flex gap-2">
          <Input
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            placeholder="输入新标签..."
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addNewTag()
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={addNewTag} className="h-8 px-3">
            确定
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAdding(false)}
            className="h-8 px-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs border-dashed"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-3 h-3 mr-2" />
          新建标签
        </Button>
      )}
    </div>
  )
}
