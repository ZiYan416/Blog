"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileText, Eye, MessageSquare } from "lucide-react";

interface ContentAnalyticsTabProps {
  topPosts: Array<{
    id: string;
    title: string;
    view_count: number;
  }>;
  totalPosts: number;
  tagData?: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
}

export function ContentAnalyticsTab({ topPosts, totalPosts, tagData = [] }: ContentAnalyticsTabProps) {
  // 准备柱状图数据
  const chartData = topPosts.slice(0, 5).map((post, index) => ({
    name: `${index + 1}. ${post.title.length > 15 ? post.title.substring(0, 15) + '...' : post.title}`,
    views: post.view_count || 0,
  }));

  // 使用真实的标签数据
  const hasTagData = tagData && tagData.length > 0;
  const totalArticles = hasTagData ? tagData.reduce((sum, item) => sum + item.value, 0) : 0;

  return (
    <div className="space-y-6">
      {/* 内容概览卡片 */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-2xl bg-blue-500/10">
                <FileText className="w-4 h-4 md:w-6 md:h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold">{totalPosts}</div>
                <div className="text-[10px] md:text-xs text-neutral-500">总发布文章</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-2xl bg-purple-500/10">
                <Eye className="w-4 h-4 md:w-6 md:h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold">
                  {topPosts[0]?.view_count || 0}
                </div>
                <div className="text-[10px] md:text-xs text-neutral-500">最高阅读量</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-2xl bg-green-500/10">
                <MessageSquare className="w-4 h-4 md:w-6 md:h-6 text-green-500" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold">
                  {Math.round(
                    topPosts.reduce((sum, p) => sum + (p.view_count || 0), 0) /
                      (topPosts.length || 1)
                  )}
                </div>
                <div className="text-[10px] md:text-xs text-neutral-500">平均阅读量</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 热门文章排行 */}
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">热门文章 Top 5</CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6 pb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" opacity={0.3} />
                <XAxis
                  type="number"
                  stroke="#a3a3a3"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#a3a3a3"
                  fontSize={10}
                  width={100}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e5e5",
                    borderRadius: "12px",
                    padding: "8px 12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="views" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 标签分布 */}
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">标签分布</CardTitle>
          </CardHeader>
          <CardContent>
            {hasTagData ? (
              <div className="flex flex-col items-center justify-around gap-6">
                {/* 饼图 */}
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tagData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {tagData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 图例 */}
                <div className="space-y-3">
                  {tagData.map((tag) => (
                    <div key={tag.name} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{tag.name}</div>
                        <div className="text-xs text-neutral-500">
                          {tag.value} 篇 (
                          {((tag.value / totalArticles) * 100).toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-neutral-400 text-sm">暂无标签数据</p>
                  <p className="text-neutral-300 text-xs mt-1">发布带标签的文章后即可查看</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
