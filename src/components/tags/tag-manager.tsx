"use client"

import { useState } from "react"
import { deleteTag, updateTag, createTag, getAllTags } from "@/app/actions/tags"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Trash2, Edit2, Plus, Tag, Search, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { getTagStyles } from "@/lib/tag-color"

interface TagItem {
  id: string
  name: string
  slug: string
  post_count: number
}

interface TagManagerProps {
  initialTags: TagItem[]
}

export function TagManager({ initialTags }: TagManagerProps) {
  const [tags, setTags] = useState<TagItem[]>(initialTags)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [currentTag, setCurrentTag] = useState<TagItem | null>(null)
  const [newTagName, setNewTagName] = useState("")
  const { toast } = useToast()

  const fetchTags = async () => {
    const data = await getAllTags()
    setTags(data as any || [])
  }

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async () => {
    if (!newTagName.trim()) return
    setLoading(true)

    const result = await createTag(newTagName)
    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Tag created successfully",
      })
      setIsCreateOpen(false)
      setNewTagName("")
      await fetchTags()
    }
    setLoading(false)
  }

  const handleUpdate = async () => {
    if (!currentTag || !newTagName.trim()) return
    setLoading(true)

    const result = await updateTag(currentTag.id, newTagName)
    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to update tag",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Tag updated successfully",
      })
      setIsEditOpen(false)
      setCurrentTag(null)
      setNewTagName("")
      await fetchTags()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag? This cannot be undone.")) return
    setLoading(true)

    const result = await deleteTag(id)
    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      })
      await fetchTags()
    }
    setLoading(false)
  }

  const openEdit = (tag: TagItem) => {
    setCurrentTag(tag)
    setNewTagName(tag.name)
    setIsEditOpen(true)
  }

  // Generate a deterministic rotation based on string hash
  const getRotation = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    // Returns a number between -3 and 3
    return (hash % 7) - 3
  }

  return (
    <div className="space-y-8">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索标签..."
            className="pl-9 bg-transparent border-black/10 dark:border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto rounded-full px-6">
              <Plus className="w-4 h-4 mr-2" />
              新建标签
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建标签</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="输入标签名称..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? "创建中..." : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tag Cloud Area */}
      {filteredTags.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-4 opacity-50">
          <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
            <Tag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">没有找到标签</h3>
          <p className="text-muted-foreground max-w-sm">
            还没有创建任何标签，或者搜索结果为空。
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap content-start gap-4 p-4 min-h-[300px]">
          {filteredTags.map((tag, index) => {
            const rotation = getRotation(tag.id)
            const styles = getTagStyles(tag.name)

            return (
              <div
                key={tag.id}
                className="group relative"
                style={{
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                {/* Tag Card */}
                <Link
                  href={`/tag/${tag.slug}`}
                  className={cn(
                    "relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300",
                    "backdrop-blur-md shadow-sm",
                    "group-hover:scale-105 group-hover:rotate-0 group-hover:shadow-md group-hover:z-10",
                    "cursor-pointer"
                  )}
                  style={{
                    backgroundColor: styles.backgroundColor,
                    borderColor: styles.borderColor,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  }}
                >
                  <Tag className="w-4 h-4 opacity-70" style={{ color: styles.color }} />
                  <span className="text-lg font-bold" style={{ color: '#333' }}>
                    {tag.name}
                  </span>

                  {tag.post_count > 0 && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 text-neutral-800">
                      {tag.post_count}
                    </span>
                  )}
                </Link>

                {/* Hover Actions Overlay */}
                <div className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 flex gap-1 scale-90 group-hover:scale-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-lg bg-white dark:bg-neutral-800 border border-black/5 hover:bg-blue-50 hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEdit(tag)
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-lg bg-white dark:bg-neutral-800 border border-black/5 hover:bg-red-50 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(tag.id)
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑标签</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">标签名称</label>
              <Input
                placeholder="输入标签名称..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            {currentTag && (
              <div className="space-y-2">
                 <label className="text-sm font-medium text-muted-foreground">Slug (自动生成)</label>
                 <Input
                   disabled
                   value={currentTag.slug}
                   className="bg-muted font-mono text-xs"
                 />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>取消</Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
