'use client'

import { useState } from 'react'
import { Comment, submitComment } from '@/app/actions/comment'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { User, Clock, MessageSquare } from 'lucide-react'
import { formatDateString } from '@/lib/markdown'
import { useRouter } from 'next/navigation'

interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('content', content)
    formData.append('authorName', authorName)
    formData.append('authorEmail', authorEmail)

    try {
      const result = await submitComment(postId, formData)

      if (result.error) {
        toast({
          title: "发布失败",
          description: result.error,
          variant: "destructive"
        })
      } else {
        toast({
          title: result.approved ? "评论已发布" : "评论提交成功",
          description: result.approved ? "您的评论已显示。" : "您的评论正在等待审核，管理员通过后将显示。",
        })
        setContent('')
        // 刷新页面以显示新评论（如果是自动通过的话）
        if (result.approved) {
          router.refresh()
        }
      }
    } catch (error) {
      toast({
        title: "出错啦",
        description: "网络请求失败，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-16 pt-12 border-t border-black/5 dark:border-white/5" id="comments">
      <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        评论 ({initialComments.length})
      </h3>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-3xl mb-12 border border-black/5 dark:border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="昵称 (可选)"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            className="bg-white dark:bg-black/20 border-transparent focus:border-black/10 dark:focus:border-white/10 rounded-xl"
          />
          <Input
            placeholder="邮箱 (可选，保密)"
            type="email"
            value={authorEmail}
            onChange={e => setAuthorEmail(e.target.value)}
            className="bg-white dark:bg-black/20 border-transparent focus:border-black/10 dark:focus:border-white/10 rounded-xl"
          />
        </div>
        <Textarea
          placeholder="写下您的想法..."
          className="bg-white dark:bg-black/20 border-transparent focus:border-black/10 dark:focus:border-white/10 min-h-[120px] rounded-xl mb-4 resize-none"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="rounded-full px-6">
            {isSubmitting ? '提交中...' : '发送评论'}
          </Button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-8">
        {initialComments.length === 0 ? (
          <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900/30 rounded-3xl border-2 border-dashed border-black/5 dark:border-white/5">
            <p className="text-neutral-400">暂无评论，来坐沙发吧！</p>
          </div>
        ) : (
          initialComments.map(comment => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 font-bold text-sm">
                {comment.author_name ? comment.author_name[0].toUpperCase() : 'A'}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{comment.author_name || '匿名用户'}</span>
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateString(comment.created_at)}
                  </span>
                </div>
                <div className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed bg-white dark:bg-neutral-900 p-4 rounded-r-2xl rounded-bl-2xl shadow-sm border border-black/5 dark:border-white/5">
                  {comment.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
