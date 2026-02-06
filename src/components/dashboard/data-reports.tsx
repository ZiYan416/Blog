"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Hash } from "lucide-react";

interface DataReportsProps {
  topPosts: any[];
  tagStats?: any[]; // Placeholder for future tag stats
}

export function DataReports({ topPosts }: DataReportsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Top Articles */}
      <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            热门文章 Top 5
          </CardTitle>
          <CardDescription>
            阅读量最高的文章排行
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-1">
            {topPosts.map((post, index) => (
              <div
                key={post.id}
                className="flex items-center gap-4 px-6 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                  ${index === 1 ? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400' : ''}
                  ${index === 2 ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                  ${index > 2 ? 'text-neutral-400' : ''}
                `}>
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{post.title}</p>
                </div>
                <div className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {post.view_count || 0}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health / Future expansion */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl overflow-hidden h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5 opacity-80" />
            系统洞察
          </CardTitle>
          <CardDescription className="text-indigo-100">
            内容生态数据分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
               <div className="text-sm opacity-80 mb-1">内容健康度</div>
               <div className="text-2xl font-bold">优秀</div>
               <p className="text-xs opacity-60 mt-1">持续更新内容，保持社区活跃。</p>
            </div>

            <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">存储空间使用</span>
                    <span className="text-xs opacity-80">12%</span>
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/40 w-[12%]" />
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
