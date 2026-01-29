'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Star, Trash2, Loader2 } from 'lucide-react'
import { toggleFeaturedStatus, deletePost } from '@/app/actions/post'
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface AdminPostActionsProps {
  id: string
  isFeatured?: boolean
  title?: string
  mode: 'star' | 'delete'
}

export function AdminPostActions({ id, isFeatured, title, mode }: AdminPostActionsProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleToggleFeatured = async () => {
    setLoading(true)
    try {
      const result = await toggleFeaturedStatus(id, !!isFeatured)
      if (result.error) throw new Error(result.error)

      toast({
        title: !isFeatured ? "已设为精选" : "已取消精选",
        description: !isFeatured ? "该文章将在首页精选栏目展示" : "该文章已从首页移除",
      })
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const result = await deletePost(id)
      if (result.error) throw new Error(result.error)

      toast({
        title: "删除成功",
        description: "文章已被永久删除",
      })
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'star') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleFeatured}
        disabled={loading}
        className={cn(
          "hover:bg-amber-50 hover:text-amber-500 transition-all",
          isFeatured ? "text-amber-500" : "text-neutral-300"
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Star className={cn("w-4 h-4", isFeatured && "fill-current")} />
        )}
      </Button>
    )
  }

  if (mode === 'delete') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除文章？</AlertDialogTitle>
            <AlertDialogDescription>
              您正在删除文章 "{title}"。此操作无法撤销，文章将被永久移除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return null
}