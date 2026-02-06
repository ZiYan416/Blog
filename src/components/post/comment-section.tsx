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
import { getCardStyle } from '@/lib/card-styles'
import { cn } from '@/lib/utils'

interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
  currentUser?: {
    id: string
    name: string
    email: string
    avatar_url?: string | null
    card_bg?: string | null
  } | null
}

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function CommentSection({ postId, initialComments, currentUser }: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      toast({
        title: "请先登录",
        description: "登录后即可发表精彩评论",
        action: (
          <Button variant="outline" size="sm" onClick={() => router.push('/auth/login')}>
            去登录
          </Button>
        ),
      })
      return
    }

    if (!content.trim()) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('content', content)

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
    <div className="mt-8 md:mt-16 pt-8 md:pt-12 border-t border-black/5 dark:border-white/5" id="comments">
      <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        评论 ({initialComments.length})
      </h3>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-3xl mb-12 border border-black/5 dark:border-white/5">
        {currentUser ? (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">正在以</span>
              <span className="font-bold mx-1 text-black dark:text-white">{currentUser.name}</span>
              <span className="text-neutral-500 dark:text-neutral-400">的身份发表评论</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-4 text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <User className="w-4 h-4" />
            登录后即可发表评论
          </div>
        )}

        <Textarea
          placeholder={currentUser ? "写下您的想法..." : "请先登录后再发表评论..."}
          className="bg-white dark:bg-black/20 border-transparent focus:border-black/10 dark:focus:border-white/10 min-h-[120px] rounded-xl mb-4 resize-none"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
          disabled={!currentUser}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !currentUser} className="rounded-full px-6">
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
          initialComments.map(comment => {
            const author = comment.profiles || { display_name: '匿名用户', avatar_url: null, bio: null, email: null, card_bg: 'default' }
            const displayName = author.display_name || '匿名用户'
            const bgStyle = getCardStyle(author.card_bg)

            return (
              <div key={comment.id} className="flex gap-4 group">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:ring-2 ring-black/5 transition-all">
                      {author.avatar_url ? (
                        <img src={author.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-neutral-500 font-bold text-sm">
                          {displayName[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 overflow-hidden rounded-2xl border-none shadow-xl">
                    <div className={cn("relative h-24 transition-colors", bgStyle.class)}>
                      <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-full border-4 border-white dark:border-neutral-900 overflow-hidden bg-white dark:bg-black">
                        {author.avatar_url ? (
                          <img src={author.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-8 px-6 pb-6 bg-white dark:bg-neutral-900">
                      <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                          {displayName}
                        </h4>
                        {author.email && (
                          <span className="text-xs text-neutral-400 font-normal break-all">
                            {author.email}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 italic line-clamp-2">
                        "{author.bio || '这个人很懒，什么都没写'}"
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{displayName}</span>
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
            )
          })
        )}
      </div>
    </div>
  )
}
