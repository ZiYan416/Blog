"use client"

import { useState } from "react"
import { AnalyticsDateRange, DateRange } from "./analytics-date-range"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { OverviewTab } from "./analytics/overview-tab"
import { ContentAnalyticsTab } from "./analytics/content-analytics-tab"
import { UserGrowthTab } from "./analytics/user-growth-tab"
import { EngagementTab } from "./analytics/engagement-tab"

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

const tabOrder = ["overview", "content", "users", "engagement"]

export function AnalyticsTabsWrapper({ data7d, data30d, dataAll }: Props) {
  const [dateRange, setDateRange] = useState<DateRange>('7d')
  const [activeTab, setActiveTab] = useState("overview")
  const [direction, setDirection] = useState(0)

  const currentData = dateRange === '7d' ? data7d : dateRange === '30d' ? data30d : dataAll

  // 根据时间范围生成标题文本
  const getRangeText = () => {
    if (dateRange === '7d') return { period: '7天', label: '7日' }
    if (dateRange === '30d') return { period: '30天', label: '30日' }
    return { period: '历史', label: '总计' }
  }

  const handleTabChange = (value: string) => {
    const currentIndex = tabOrder.indexOf(activeTab)
    const newIndex = tabOrder.indexOf(value)
    const newDirection = newIndex > currentIndex ? 1 : -1
    setDirection(newDirection)
    setActiveTab(value)
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  }

  const rangeText = getRangeText()

  return (
    <div className="space-y-6">
      {/* 标题 + Tab切换器（左侧） + 日期范围选择器（右侧） */}
      <div className="flex items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          <h2 className="text-lg md:text-xl font-semibold whitespace-nowrap">数据分析</h2>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-4 rounded-full p-1 bg-neutral-100 dark:bg-neutral-800 h-10 md:h-auto">
              <TabsTrigger value="overview" className="rounded-full gap-1 md:gap-2 text-xs px-3 h-8 md:h-auto">
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline text-[10px] md:text-xs">数据总览</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="rounded-full gap-1 md:gap-2 text-xs px-3 h-8 md:h-auto">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline text-[10px] md:text-xs">内容分析</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-full gap-1 md:gap-2 text-xs px-3 h-8 md:h-auto">
                <Users className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline text-[10px] md:text-xs">用户增长</span>
              </TabsTrigger>
              <TabsTrigger value="engagement" className="rounded-full gap-1 md:gap-2 text-xs px-3 h-8 md:h-auto">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline text-[10px] md:text-xs">互动分析</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <AnalyticsDateRange value={dateRange} onChange={setDateRange} />
      </div>

      {/* 内容区域（带动画） */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            {activeTab === "overview" && <OverviewTab data={currentData} rangeText={rangeText} />}
            {activeTab === "content" && (
              <ContentAnalyticsTab
                topPosts={currentData.topPosts}
                totalPosts={currentData.stats.totalPosts}
                tagData={currentData.tagData}
              />
            )}
            {activeTab === "users" && (
              <UserGrowthTab
                totalUsers={currentData.stats.totalUsers}
                userGrowth={currentData.userGrowth}
                rangeText={rangeText}
              />
            )}
            {activeTab === "engagement" && (
              <EngagementTab
                totalComments={currentData.stats.totalComments}
                totalViews={currentData.stats.totalViews}
                commentTrend={currentData.commentTrend}
                topCommenters={currentData.topCommenters}
                rangeText={rangeText}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
