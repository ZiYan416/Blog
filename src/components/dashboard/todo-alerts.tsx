'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, MessageSquare, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface TodoAlertsProps {
  pendingCommentsCount: number
  oldDraftsCount: number
}

export function TodoAlerts({ pendingCommentsCount, oldDraftsCount }: TodoAlertsProps) {
  const hasTodos = pendingCommentsCount > 0 || oldDraftsCount > 0

  return (
    <Card className="border-none bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          待办事项
        </CardTitle>
        <CardDescription>
          需要您关注的内容
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {!hasTodos ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-sm text-neutral-500">暂无待办事项</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 待审核评论 */}
            {pendingCommentsCount > 0 && (
              <Link
                href="/dashboard/comments"
                className="group flex items-center justify-between p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 hover:border-red-200 dark:hover:border-red-900/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                      待审核评论
                    </p>
                    <p className="text-xs text-neutral-500">
                      {pendingCommentsCount} 条评论等待审核
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="rounded-full">
                    {pendingCommentsCount}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}

            {/* 长期草稿提醒 */}
            {oldDraftsCount > 0 && (
              <Link
                href="/post?filter=drafts"
                className="group flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 hover:border-amber-200 dark:hover:border-amber-900/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                      长期未发布草稿
                    </p>
                    <p className="text-xs text-neutral-500">
                      {oldDraftsCount} 篇草稿超过 7 天未发布
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    {oldDraftsCount}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
