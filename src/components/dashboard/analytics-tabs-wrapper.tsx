"use client"

import { useState } from "react"
import { AnalyticsDateRange, DateRange } from "./analytics-date-range"
import { AnalyticsTabs } from "./analytics-tabs"

interface AnalyticsData {
  stats: {
    totalPosts: number
    totalViews: number
    totalComments: number
    totalUsers: number
  }
  topPosts: Array<{ id: string; title: string; view_count: number }>
  recentActivity?: Array<{ date: string; posts: number; views: number; comments: number }>
  tagData?: Array<{ name: string; value: number; color: string }>
  userGrowth?: Array<{ date: string; totalUsers: number; newUsers: number }>
  commentTrend?: Array<{ date: string; comments: number }>
  topCommenters?: Array<{ name: string; count: number; lastComment: string }>
}

interface Props {
  data7d: AnalyticsData
  data30d: AnalyticsData
  dataAll: AnalyticsData
}

export function AnalyticsTabsWrapper({ data7d, data30d, dataAll }: Props) {
  const [dateRange, setDateRange] = useState<DateRange>('7d')

  const currentData = dateRange === '7d' ? data7d : dateRange === '30d' ? data30d : dataAll

  // 根据时间范围生成标题文本
  const getRangeText = () => {
    if (dateRange === '7d') return { period: '7天', label: '7日' }
    if (dateRange === '30d') return { period: '30天', label: '30日' }
    return { period: '历史', label: '总计' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">数据分析</h2>
        <AnalyticsDateRange value={dateRange} onChange={setDateRange} />
      </div>
      <AnalyticsTabs
        data={currentData}
        dateRange={dateRange}
        rangeText={getRangeText()}
      />
    </div>
  )
}
