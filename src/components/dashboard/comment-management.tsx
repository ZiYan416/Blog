'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
  MessageSquare,
  Clock,
  User
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

interface Comment {
  id: string
  content: string
  approved: boolean
  created_at: string
  user: {
    id: string
    display_name: string
    avatar_url?: string
    email: string
  }
  post: {
    id: string
    title: string
    slug: string
  }
}

interface CommentManagementProps {
  initialComments: Comment[]
}

export function CommentManagement({ initialComments }: CommentManagementProps) {
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [loading, setLoading] = useState<string | null>(null)

  const pendingComments = comments.filter(c => !c.approved)
  const approvedComments = comments.filter(c => c.approved)

  const handleApprove = async (commentId: string) => {
    setLoading(commentId)
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PATCH',
      })

      if (!res.ok) throw new Error('Failed to approve comment')

      setComments(prev =>
        prev.map(c => c.id === commentId ? { ...c, approved: true } : c)
      )
      toast.success('评论已批准')
      router.refresh()
    } catch (error) {
      console.error('Approve error:', error)
      toast.error('批准评论失败')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？此操作无法撤销。')) return

    setLoading(commentId)
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete comment')

      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('评论已删除')
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('删除评论失败')
    } finally {
      setLoading(null)
    }
  }

  const CommentCard = ({ comment }: { comment: Comment }) => (
    <Card className="border-black/[0.03] dark:border-white/[0.03] rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
            {comment.user.avatar_url ? (
              <img
                src={comment.user.avatar_url}
                alt={comment.user.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-5 h-5 text-neutral-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* User Info & Status */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-medium text-sm">
                {comment.user.display_name}
              </span>
              <span className="text-xs text-neutral-400">
                {comment.user.email}
              </span>
              {comment.approved ? (
                <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20">
                  已批准
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-600 bg-orange-50 dark:bg-orange-900/20">
                  待审核
                </Badge>
              )}
            </div>

            {/* Comment Content */}
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3 leading-relaxed">
              {comment.content}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(comment.created_at).toLocaleString('zh-CN')}
              </div>
              <Link
                href={`/post/${comment.post.slug}`}
                className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                {comment.post.title}
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!comment.approved && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleApprove(comment.id)}
                  disabled={loading === comment.id}
                  className="rounded-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  批准
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(comment.id)}
                disabled={loading === comment.id}
                className="rounded-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                删除
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="mb-6 bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03] p-1 rounded-2xl">
        <TabsTrigger value="pending" className="rounded-xl">
          待审核 ({pendingComments.length})
        </TabsTrigger>
        <TabsTrigger value="approved" className="rounded-xl">
          已批准 ({approvedComments.length})
        </TabsTrigger>
        <TabsTrigger value="all" className="rounded-xl">
          全部 ({comments.length})
        </TabsTrigger>
      </TabsList>

      {/* Pending Comments */}
      <TabsContent value="pending" className="space-y-4">
        {pendingComments.length === 0 ? (
          <Card className="border-dashed border-2 border-black/5 dark:border-white/5 rounded-3xl">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-neutral-500">暂无待审核评论</p>
            </CardContent>
          </Card>
        ) : (
          pendingComments.map(comment => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}
      </TabsContent>

      {/* Approved Comments */}
      <TabsContent value="approved" className="space-y-4">
        {approvedComments.length === 0 ? (
          <Card className="border-dashed border-2 border-black/5 dark:border-white/5 rounded-3xl">
            <CardContent className="p-12 text-center">
              <p className="text-neutral-500">暂无已批准评论</p>
            </CardContent>
          </Card>
        ) : (
          approvedComments.map(comment => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}
      </TabsContent>

      {/* All Comments */}
      <TabsContent value="all" className="space-y-4">
        {comments.length === 0 ? (
          <Card className="border-dashed border-2 border-black/5 dark:border-white/5 rounded-3xl">
            <CardContent className="p-12 text-center">
              <p className="text-neutral-500">暂无评论</p>
            </CardContent>
          </Card>
        ) : (
          comments.map(comment => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}
