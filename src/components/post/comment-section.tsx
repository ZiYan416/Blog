'use client'

import { useState } from 'react'
import { Comment, submitComment } from '@/app/actions/comment'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { User, Clock, MessageSquare, Reply } from 'lucide-react'
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

// 评论表单组件
function CommentForm({
  postId,
  currentUser,
  parentId = null,
  parentAuthor = null,
  onSuccess,
  onCancel,
}: {
  postId: string
  currentUser?: CommentSectionProps['currentUser']
  parentId?: string | null
  parentAuthor?: string | null
  onSuccess?: () => void
  onCancel?: () => void
}) {
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
      const result = await submitComment(postId, formData, parentId)

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
        onSuccess?.()
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

  const isReply = parentId !== null

  return (
    <form onSubmit={handleSubmit} className={cn(
      "bg-neutral-50 dark:bg-neutral-900/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-black/5 dark:border-white/5",
      isReply && "ml-0 md:ml-14"
    )}>
      {isReply && parentAuthor && (
        <div className="text-xs text-neutral-500 mb-3 flex items-center gap-1">
          <Reply className="w-3 h-3" />
          回复 <span className="font-medium text-neutral-700 dark:text-neutral-300">{parentAuthor}</span>
        </div>
      )}

      {currentUser && !isReply && (
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
      )}

      {!currentUser && (
        <div className="flex items-center gap-3 mb-4 text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-900/50">
          <User className="w-4 h-4" />
          登录后即可发表评论
        </div>
      )}

      <Textarea
        placeholder={currentUser ? (isReply ? "写下您的回复..." : "写下您的想法...") : "请先登录后再发表评论..."}
        className="bg-white dark:bg-black/20 border-transparent focus:border-black/10 dark:focus:border-white/10 min-h-[100px] rounded-xl mb-3 resize-none text-sm"
        value={content}
        onChange={e => setContent(e.target.value)}
        required
        disabled={!currentUser}
      />
      <div className="flex justify-end gap-2">
        {isReply && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-full px-4 text-xs md:text-sm">
            取消
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || !currentUser} className="rounded-full px-4 md:px-6 text-xs md:text-sm">
          {isSubmitting ? '提交中...' : (isReply ? '发送回复' : '发送评论')}
        </Button>
      </div>
    </form>
  )
}

// 单个评论项组件（支持递归显示回复）
function CommentItem({
  comment,
  postId,
  currentUser,
  depth = 0,
}: {
  comment: Comment
  postId: string
  currentUser?: CommentSectionProps['currentUser']
  depth?: number
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  const author = comment.profiles || { display_name: '匿名用户', avatar_url: null, bio: null, email: null, card_bg: 'default' }
  const displayName = author.display_name || '匿名用户'
  const bgStyle = getCardStyle(author.card_bg)

  const maxDepth = 3 // 最大嵌套层级

  return (
    <div className={cn("space-y-4", depth > 0 && "ml-6 md:ml-14")}>
      <div className="flex gap-3 md:gap-4 group">
        <Popover>
          <PopoverTrigger asChild>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:ring-2 ring-black/5 transition-all">
              {author.avatar_url ? (
                <img src={author.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-neutral-500 font-bold text-xs md:text-sm">
                  {displayName[0].toUpperCase()}
                </span>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 overflow-hidden rounded-2xl border-none shadow-xl">
            <div className={cn("relative h-24 transition-colors", bgStyle.class)}>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white dark:border-neutral-900 overflow-hidden bg-white dark:bg-black">
                {author.avatar_url ? (
                  <img src={author.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
            </div>
            <div className="pt-14 px-8 pb-8 bg-white dark:bg-neutral-900 text-center">
              <div className="mb-0">
                <h4 className="font-bold text-lg mb-1 text-neutral-900 dark:text-neutral-100 truncate">
                  {displayName}
                </h4>
                {author.email && (
                  <p className="text-xs text-neutral-500 truncate mb-6">
                    {author.email}
                  </p>
                )}
              </div>
              <div className="pt-6 border-t border-black/5 dark:border-white/5">
                <p className="text-xs text-neutral-400 italic line-clamp-2">
                  "{author.bio || '这个人很懒，什么都没写'}"
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-xs md:text-sm text-neutral-900 dark:text-neutral-100 truncate">{displayName}</span>
            <span className="text-xs text-neutral-400 flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              <span className="hidden sm:inline">{formatDateString(comment.created_at)}</span>
            </span>
          </div>
          <div className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed bg-white dark:bg-neutral-900 p-3 md:p-4 rounded-r-2xl rounded-bl-2xl shadow-sm border border-black/5 dark:border-white/5">
            {comment.content}
          </div>

          {/* 回复按钮 */}
          {depth < maxDepth && (
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1 transition-colors"
              >
                <Reply className="w-3 h-3" />
                回复
              </button>
              {comment.reply_count > 0 && (
                <span className="text-neutral-400">
                  {comment.reply_count} 条回复
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 回复表单 */}
      {showReplyForm && (
        <CommentForm
          postId={postId}
          currentUser={currentUser}
          parentId={comment.id}
          parentAuthor={displayName}
          onSuccess={() => setShowReplyForm(false)}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {/* 递归显示回复 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUser={currentUser}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentSection({ postId, initialComments, currentUser }: CommentSectionProps) {
  // 计算总评论数（包括所有回复）
  const countComments = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.replies ? countComments(comment.replies) : 0)
    }, 0)
  }

  const totalComments = countComments(initialComments)

  return (
    <div className="mt-8 md:mt-16 pt-8 md:pt-12 border-t border-black/5 dark:border-white/5" id="comments">
      <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
        评论 ({totalComments})
      </h3>

      {/* 主评论表单 */}
      <div className="mb-8 md:mb-12">
        <CommentForm postId={postId} currentUser={currentUser} />
      </div>

      {/* 评论列表 */}
      <div className="space-y-6 md:space-y-8">
        {initialComments.length === 0 ? (
          <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl md:rounded-3xl border-2 border-dashed border-black/5 dark:border-white/5">
            <p className="text-neutral-400 text-sm md:text-base">暂无评论，来坐沙发吧！</p>
          </div>
        ) : (
          initialComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  )
}
