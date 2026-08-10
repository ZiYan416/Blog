"use client"

import { useState } from "react"
import { deleteTag, updateTag, createTag, getAllTags } from "@/features/tags/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, Edit2, Plus, Tag, Search } from "lucide-react"
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
  const [tagToDelete, setTagToDelete] = useState<TagItem | null>(null)
  const [newTagName, setNewTagName] = useState("")
  const { toast } = useToast()

  const fetchTags = async () => {
    try {
      const data = await getAllTags()
      setTags(data || [])
    } catch (error) {
      console.error("Failed to refresh tags:", error)
      toast({
        title: "刷新标签失败",
        description: "标签列表刷新失败，请稍后重试。",
        variant: "destructive",
      })
    }
  }

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async () => {
    const name = newTagName.trim()
    if (!name) return
    setLoading(true)

    try {
      const result = await createTag(name)
      if (result.error) {
        toast({
          title: "创建标签失败",
          description: "标签创建失败，请稍后重试。",
          variant: "destructive",
        })
        return
      }
      toast({
        title: "标签创建成功",
        description: `“${name}” 已创建。`,
      })
      setIsCreateOpen(false)
      setNewTagName("")
      await fetchTags()
    } catch (error) {
      console.error("Failed to create tag:", error)
      toast({
        title: "创建标签失败",
        description: "标签创建失败，请检查网络后重试。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    const name = newTagName.trim()
    if (!currentTag || !name) return
    setLoading(true)

    try {
      const result = await updateTag(currentTag.id, name)
      if (result.error) {
        toast({
          title: "更新标签失败",
          description: "标签更新失败，请稍后重试。",
          variant: "destructive",
        })
        return
      }
      toast({
        title: "标签更新成功",
        description: `“${name}” 已更新。`,
      })
      setIsEditOpen(false)
      setCurrentTag(null)
      setNewTagName("")
      await fetchTags()
    } catch (error) {
      console.error("Failed to update tag:", error)
      toast({
        title: "更新标签失败",
        description: "标签更新失败，请检查网络后重试。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const tag = tagToDelete
    if (!tag) return
    setLoading(true)

    try {
      const result = await deleteTag(tag.id)
      if (result.error) {
        toast({
          title: "删除标签失败",
          description: "标签删除失败，请稍后重试。",
          variant: "destructive",
        })
        return
      }
      toast({
        title: "标签删除成功",
        description: `“${tag.name}” 已删除。`,
      })
      setTagToDelete(null)
      await fetchTags()
    } catch (error) {
      console.error("Failed to delete tag:", error)
      toast({
        title: "删除标签失败",
        description: "标签删除失败，请检查网络后重试。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            if (!loading) setIsCreateOpen(open)
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto rounded-full px-6">
              <Plus className="w-4 h-4 mr-2" />
              新建标签
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建标签</DialogTitle>
              <DialogDescription>创建一个新标签，用于归类和筛选文章。</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <Label htmlFor="new-tag-name">标签名称</Label>
                <Input
                  id="new-tag-name"
                  placeholder="输入标签名称..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={loading}>取消</Button>
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
          {filteredTags.map((tag) => {
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
                  <Tag className="w-4 h-4 text-neutral-700 dark:text-white/80" />
                  <span className="text-lg font-bold text-neutral-800 dark:text-neutral-50">
                    {tag.name}
                  </span>

                  {tag.post_count > 0 && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 text-neutral-800 dark:bg-black/30 dark:text-white">
                      {tag.post_count}
                    </span>
                  )}
                </Link>

                {/* Hover Actions Overlay */}
                <div className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 flex gap-1 scale-90 group-hover:scale-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label={`编辑标签 ${tag.name}`}
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
                    aria-label={`删除标签 ${tag.name}`}
                    className="h-8 w-8 rounded-full shadow-lg bg-white dark:bg-neutral-800 border border-black/5 hover:bg-red-50 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      setTagToDelete(tag)
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
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!loading) setIsEditOpen(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑标签</DialogTitle>
            <DialogDescription>修改标签名称，Slug 会根据名称自动生成。</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tag-name">标签名称</Label>
              <Input
                id="edit-tag-name"
                placeholder="输入标签名称..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            {currentTag && (
              <div className="space-y-2">
                 <Label htmlFor="edit-tag-slug">Slug（自动生成）</Label>
                 <Input
                   id="edit-tag-slug"
                   disabled
                   value={currentTag.slug}
                   className="bg-muted font-mono text-xs"
                 />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={loading}>取消</Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!tagToDelete}
        onOpenChange={(open) => {
          if (!open && !loading) setTagToDelete(null)
        }}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除标签？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后不可恢复。已有文章会移除该标签关联，标签页也将不再显示。
              {tagToDelete ? ` 即将删除：${tagToDelete.name}` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full" disabled={loading}>取消</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-red-500 hover:bg-red-600"
              disabled={loading}
              onClick={(event) => {
                event.preventDefault()
                handleDelete()
              }}
            >
              {loading ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
