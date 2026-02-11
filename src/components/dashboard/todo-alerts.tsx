'use client'

import { Badge } from '@/components/ui/badge'
import { AlertCircle, MessageSquare, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface TodoAlertsProps {
  pendingCommentsCount: number
  oldDraftsCount: number
}

export function TodoAlerts({ pendingCommentsCount, oldDraftsCount }: TodoAlertsProps) {
  const hasTodos = pendingCommentsCount > 0 || oldDraftsCount > 0

  // 如果没有待办事项，不显示组件
  if (!hasTodos) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      {/* 待审核评论 */}
      {pendingCommentsCount > 0 && (
        <Link
          href="/dashboard/comments"
          className="group relative overflow-hidden p-5 md:p-6 rounded-3xl bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border border-red-200/50 dark:border-red-900/30 hover:border-red-300 dark:hover:border-red-900/50 transition-all shadow-sm hover:shadow-md"
        >
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mb-1">
                    待审核评论
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    需要您的审核
                  </p>
                </div>
              </div>
              <Badge variant="destructive" className="rounded-full text-sm px-3 py-1 shadow-sm">
                {pendingCommentsCount}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {pendingCommentsCount} 条评论等待处理
              </p>
              <ArrowRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 dark:bg-red-500/10 rounded-full -mr-16 -mt-16" />
        </Link>
      )}

      {/* 长期草稿提醒 */}
      {oldDraftsCount > 0 && (
        <Link
          href="/post?filter=drafts"
          className="group relative overflow-hidden p-5 md:p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-900/50 transition-all shadow-sm hover:shadow-md"
        >
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 mb-1">
                    长期草稿
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    超过 7 天未发布
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="rounded-full text-sm px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shadow-sm">
                {oldDraftsCount}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {oldDraftsCount} 篇文章待发布
              </p>
              <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 dark:bg-amber-500/10 rounded-full -mr-16 -mt-16" />
        </Link>
      )}
    </div>
  )
}
