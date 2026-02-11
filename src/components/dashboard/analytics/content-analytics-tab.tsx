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

  // 根据标签数量决定样式策略
  const tagCount = tagData.length;
  const shouldScroll = tagCount > 10;
  const legendTextSize = tagCount <= 5 ? 'text-sm' : tagCount <= 8 ? 'text-xs' : 'text-[11px]';
  const legendSubTextSize = tagCount <= 5 ? 'text-xs' : tagCount <= 8 ? 'text-[11px]' : 'text-[10px]';
  const legendGap = tagCount <= 6 ? 'space-y-3' : tagCount <= 10 ? 'space-y-2' : 'space-y-1.5';

  // 自定义 Tooltip 内容
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "8px 12px",
            fontSize: "12px",
          }}
        >
          <div className="font-medium">{data.name}</div>
          <div className="text-neutral-500">{data.value} 篇</div>
        </div>
      );
    }
    return null;
  };

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
              <div className="flex flex-col md:flex-row items-center justify-around gap-6">
                {/* 饼图 */}
                <div className="w-72 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tagData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {tagData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            className="transition-all duration-200 hover:opacity-80"
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 图例 */}
                <div className="space-y-3">
                  <div className={`${shouldScroll ? 'max-h-64 overflow-y-auto pr-2' : ''} ${legendGap} scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent`}>
                    {tagData.map((tag) => (
                      <div key={tag.name} className="flex items-center gap-3 py-0.5">
                        <div
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`${legendTextSize} font-medium truncate`}>{tag.name}</div>
                          <div className={`${legendSubTextSize} text-neutral-500`}>
                            {tag.value} 篇 ({((tag.value / totalArticles) * 100).toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
