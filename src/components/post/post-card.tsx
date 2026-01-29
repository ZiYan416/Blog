"use client"

import Link from 'next/link'
import { Calendar, Tag, Eye, Edit2, ArrowUpRight, Clock, Star, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatDateString } from '@/lib/markdown'
import { useUser } from '@/hooks/use-auth'
import { DeletePostButton } from './delete-post-button'
import { cn } from '@/lib/utils'
import { getTagStyles } from '@/lib/tag-color'
import { toggleFeaturedStatus } from '@/app/actions/post'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image: string | null
  published: boolean
  featured: boolean
  created_at: string
  updated_at: string
  tags: any[]
  category: string | null
  view_count: number
}

interface PostCardProps {
  post: Post
}

function FeaturedToggle({ id, isFeatured }: { id: string, isFeatured: boolean }) {
  const [loading, setLoading] = useState(false)
  const [featured, setFeatured] = useState(isFeatured)
  const { toast } = useToast()

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation()

    setLoading(true)
    try {
      const result = await toggleFeaturedStatus(id, featured)
      if (result.error) throw new Error(result.error)

      setFeatured(!featured)
      toast({
        title: !featured ? "已设为精选" : "已取消精选",
        description: !featured ? "该文章将在首页精选栏目展示" : "该文章已从首页移除",
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

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "w-10 h-10 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-110 transition-transform",
        featured ? "text-amber-500" : "text-neutral-400 hover:text-amber-500"
      )}
      title={featured ? "取消精选" : "设为精选"}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Star className={cn("w-4 h-4", featured && "fill-current")} />
      )}
    </button>
  )
}

export default function PostCard({ post }: PostCardProps) {
  const { isAdmin } = useUser()
  const formattedDate = formatDateString(post.created_at)
  const tags = post.tags || []

  return (
    <div className={cn(
      "group relative bg-white dark:bg-neutral-900 rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl hover:shadow-black/[0.02] dark:hover:shadow-white/[0.01] flex flex-col h-full overflow-hidden",
      post.featured ? "border-amber-500/30 dark:border-amber-500/20" : "border-black/[0.03] dark:border-white/[0.03] hover:border-black/10 dark:hover:border-white/10"
    )}>
      {/* Featured Ribbon for everyone */}
      {post.featured && (
        <div className="absolute top-0 right-0 z-30">
          <div className="bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">
            FEATURED
          </div>
        </div>
      )}

      {/* Admin Actions Overlay */}
      {isAdmin && (
        <div className="absolute top-6 left-6 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Link
            href={`/admin/posts/${post.id}/edit`}
            className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-110 transition-transform text-black dark:text-white"
            title="编辑文章"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <FeaturedToggle id={post.id} isFeatured={post.featured} />
          <DeletePostButton slug={post.slug || post.id} title={post.title} />
        </div>
      )}

      {/* Status Badge */}
      {!post.published && (
        <div className="absolute top-6 right-6 z-20">
          <span className="px-4 py-1.5 text-xs font-bold bg-amber-100/90 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 backdrop-blur-md rounded-full uppercase tracking-widest border border-amber-200/50 dark:border-amber-800/50 shadow-sm">
            草稿
          </span>
        </div>
      )}

      {/* Image Section */}
      <Link href={`/post/${post.slug || post.id}`} className="block relative aspect-[16/10] overflow-hidden">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <span className="text-2xl font-bold opacity-10">{post.title[0]}</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
      </Link>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-3 h-3" />
            {post.view_count || 0}
          </span>
        </div>

        <Link href={`/post/${post.slug || post.id}`} className="group/title inline-block">
          <h3 className="text-2xl font-bold leading-tight mb-4 group-hover/title:text-neutral-600 dark:group-hover/title:text-neutral-400 transition-colors flex items-start gap-2">
            {post.title}
            <ArrowUpRight className="w-5 h-5 opacity-0 -translate-y-1 translate-x-1 group-hover/title:opacity-100 group-hover/title:translate-y-0 group-hover/title:translate-x-0 transition-all duration-300 shrink-0 mt-1" />
          </h3>
        </Link>

        {post.excerpt && (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-6 line-clamp-2">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto pt-6 border-t border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.slice(0, 2).map((tag: string) => {
                const styles = getTagStyles(tag)
                return (
                  <span
                    key={tag}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
                    )}
                    style={{ backgroundColor: styles.backgroundColor, color: '#333' }}
                  >
                    {tag}
                  </span>
                )
              })
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 dark:text-neutral-700">
                Uncategorized
              </span>
            )}
          </div>

          <Link
            href={`/post/${post.slug || post.id}`}
            className="text-[11px] font-bold uppercase tracking-widest hover:underline underline-offset-4"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  )
}
