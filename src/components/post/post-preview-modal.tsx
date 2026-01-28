"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Calendar, Tag, Eye, Clock, User, X } from 'lucide-react'
import { formatDateString, calculateReadingTime } from '@/lib/markdown'
import { CommentSection } from '@/components/post/comment-section'
import { MarkdownRenderer } from '@/components/post/markdown-renderer'

interface PostPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: {
    title: string
    content: string // HTML content
    coverImage: string
    tags: string[]
    slug: string
    author?: {
      display_name?: string
      avatar_url?: string
      bio?: string
      email?: string
    }
    published?: boolean
    created_at?: string
  }
}

export function PostPreviewModal({ open, onOpenChange, post }: PostPreviewModalProps) {
  const readingTime = calculateReadingTime(post.content || '')
  const formattedDate = formatDateString(post.created_at || new Date().toISOString())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] h-screen p-0 border-none rounded-none bg-[#fafafa] dark:bg-[#050505] overflow-hidden focus:outline-none">
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">文章预览: {post.title}</DialogTitle>

        {/* Floating Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </Button>

        <ScrollArea className="h-full w-full">
          <div className="min-h-screen pb-20">
            {/* Hero Header */}
            <div className="relative w-full h-[35vh] min-h-[300px] bg-neutral-900 dark:bg-black overflow-hidden">
              {post.coverImage && (
                <div className="absolute inset-0 opacity-60">
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] dark:from-[#050505] via-transparent to-transparent" />
                </div>
              )}

              <div className="container max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-24 relative z-10">
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-sm">
                    {post.title || '无标题文章'}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-neutral-400">
                    <span className="bg-black/20 dark:bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 text-white/90">
                      <Calendar className="w-3.5 h-3.5" />
                      {formattedDate}
                    </span>
                    <span className="bg-black/20 dark:bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 text-white/90">
                      <Clock className="w-3.5 h-3.5" />
                      {readingTime}
                    </span>
                    <span className="bg-amber-500/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/50 text-white font-bold uppercase tracking-wider">
                      实时预览模式
                    </span>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/90 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                          <Tag className="w-3 h-3 opacity-70" />
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="container max-w-6xl mx-auto px-6 -mt-12 relative z-20">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                {/* Main Content */}
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-10 shadow-xl border border-black/5 dark:border-white/5">
                  <MarkdownRenderer content={post.content} />

                  {/* Mock Comments */}
                  <div className="mt-12 pt-12 border-t border-black/5 dark:border-white/5 opacity-50">
                    <h3 className="font-bold mb-4">评论区 (预览模式不可用)</h3>
                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 text-center text-sm text-neutral-400">
                      评论功能将在文章发布后开启
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                  <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5 sticky top-24">
                    <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-neutral-400">About Author</h3>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4 overflow-hidden">
                         <div className="w-full h-full flex items-center justify-center text-neutral-300">
                           <User className="w-8 h-8" />
                         </div>
                      </div>
                      <h4 className="font-bold text-lg mb-1">{post.author?.display_name || '当前用户'}</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {post.author?.bio || '预览模式作者信息'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
