"use client"

import Link from 'next/link'
import { Calendar, Tag, Eye, Edit2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDateString } from '@/lib/markdown'
import { useUser } from '@/hooks/use-auth'
import { DeletePostButton } from './delete-post-button'

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image: string | null
  published: boolean
  created_at: string
  updated_at: string
  tags: any[]
  category: string | null
  view_count: number
}

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const { isAdmin } = useUser()
  const formattedDate = formatDateString(post.created_at)
  const tags = post.tags || []

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 group relative">
      {!post.published && (
        <div className="absolute top-4 right-4 z-10">
          <span className="px-2 py-1 text-[10px] font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full uppercase tracking-wider shadow-sm">
            草稿
          </span>
        </div>
      )}
      <Link href={`/post/${post.slug || post.id}`}>
        {post.cover_image && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.view_count || 0}
            </span>
          </div>
          <h3 className="text-xl font-semibold hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {post.excerpt}
            </p>
          )}
        </CardHeader>
      </Link>
      <CardContent>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/post/${post.slug || post.id}`}>
            阅读更多
          </Link>
        </Button>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
              <Link href={`/admin/posts/${post.id}/edit`}>
                <Edit2 className="w-4 h-4" />
              </Link>
            </Button>
            <DeletePostButton slug={post.slug || post.id} title={post.title} />
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
