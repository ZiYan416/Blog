"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, MessageSquare } from "lucide-react";
import { OverviewTab } from "./analytics/overview-tab";
import { ContentAnalyticsTab } from "./analytics/content-analytics-tab";
import { UserGrowthTab } from "./analytics/user-growth-tab";
import { EngagementTab } from "./analytics/engagement-tab";

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

export function AnalyticsTabs({ data, dateRange = '7d', rangeText = { period: '7天', label: '7日' } }: AnalyticsTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab data={data} rangeText={rangeText} />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentAnalyticsTab
            topPosts={data.topPosts}
            totalPosts={data.stats.totalPosts}
            tagData={data.tagData}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserGrowthTab
            totalUsers={data.stats.totalUsers}
            userGrowth={data.userGrowth}
            rangeText={rangeText}
          />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <EngagementTab
            totalComments={data.stats.totalComments}
            totalViews={data.stats.totalViews}
            commentTrend={data.commentTrend}
            topCommenters={data.topCommenters}
            rangeText={rangeText}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
