"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, MessageSquare } from "lucide-react";
import { OverviewTab } from "./analytics/overview-tab";
import { ContentAnalyticsTab } from "./analytics/content-analytics-tab";
import { UserGrowthTab } from "./analytics/user-growth-tab";
import { EngagementTab } from "./analytics/engagement-tab";
import { motion, AnimatePresence } from "framer-motion";

interface AnalyticsData {
  stats: {
    totalPosts: number;
    totalViews: number;
    totalComments: number;
    totalUsers: number;
  };
  topPosts: Array<{
    id: string;
    title: string;
    view_count: number;
  }>;
  recentActivity?: Array<{
    date: string;
    posts: number;
    views: number;
    comments: number;
  }>;
  tagData?: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  userGrowth?: Array<{
    date: string;
    totalUsers: number;
    newUsers: number;
  }>;
  commentTrend?: Array<{
    date: string;
    comments: number;
  }>;
  topCommenters?: Array<{
    name: string;
    count: number;
    lastComment: string;
  }>;
}

interface AnalyticsTabsProps {
  data: AnalyticsData;
  dateRange?: '7d' | '30d' | 'all';
  rangeText?: {
    period: string;  // "7天" | "30天" | "历史"
    label: string;   // "7日" | "30日" | "总计"
  };
}

const tabOrder = ["overview", "content", "users", "engagement"];

export function AnalyticsTabs({ data, dateRange = '7d', rangeText = { period: '7天', label: '7日' } }: AnalyticsTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [direction, setDirection] = useState(0);

  const handleTabChange = (value: string) => {
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(value);
    const newDirection = newIndex > currentIndex ? 1 : -1;
    setDirection(newDirection);
    setActiveTab(value);
  };

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
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid rounded-full p-1 bg-neutral-100 dark:bg-neutral-800">
          <TabsTrigger value="overview" className="rounded-full gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">数据总览</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="rounded-full gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">内容分析</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-full gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">用户增长</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="rounded-full gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">互动分析</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
            {activeTab === "overview" && <OverviewTab data={data} rangeText={rangeText} />}
            {activeTab === "content" && (
              <ContentAnalyticsTab
                topPosts={data.topPosts}
                totalPosts={data.stats.totalPosts}
                tagData={data.tagData}
              />
            )}
            {activeTab === "users" && (
              <UserGrowthTab
                totalUsers={data.stats.totalUsers}
                userGrowth={data.userGrowth}
                rangeText={rangeText}
              />
            )}
            {activeTab === "engagement" && (
              <EngagementTab
                totalComments={data.stats.totalComments}
                totalViews={data.stats.totalViews}
                commentTrend={data.commentTrend}
                topCommenters={data.topCommenters}
                rangeText={rangeText}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
