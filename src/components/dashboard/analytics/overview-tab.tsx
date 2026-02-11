"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface OverviewTabProps {
  data: {
    stats: {
      totalPosts: number;
      totalViews: number;
      totalComments: number;
      totalUsers: number;
    };
    recentActivity?: Array<{
      date: string;
      posts: number;
      views: number;
      comments: number;
    }>;
  };
  rangeText?: {
    period: string;
    label: string;
  };
}

export function OverviewTab({ data, rangeText = { period: '7天', label: '7日' } }: OverviewTabProps) {
  // 检查是否有数据
  const hasData = data.recentActivity && data.recentActivity.length > 0;
  const chartData = hasData ? data.recentActivity : generateEmptyData();

  // 计算关键指标
  const avgViewsPerPost = data.stats.totalPosts > 0
    ? Math.round(data.stats.totalViews / data.stats.totalPosts)
    : 0;

  const engagementRate = data.stats.totalViews > 0
    ? ((data.stats.totalComments / data.stats.totalViews) * 100).toFixed(2)
    : "0.00";

  const metrics = [
    {
      label: "平均阅读量",
      value: avgViewsPerPost,
      unit: "次/篇",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "评论互动率",
      value: engagementRate,
      unit: "%",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden"
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-center mb-3 md:mb-4">
                <div className={`p-2 md:p-3 rounded-2xl ${metric.bgColor}`}>
                  <TrendingUp className={`w-4 h-4 md:w-6 md:h-6 ${metric.color}`} />
                </div>
              </div>
              <div className="space-y-1 text-center">
                <div className="text-xl md:text-2xl font-bold">
                  {metric.value}
                  <span className="text-xs md:text-sm text-neutral-500 ml-1 font-normal">
                    {metric.unit}
                  </span>
                </div>
                <div className="text-[10px] md:text-xs text-neutral-500">{metric.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 趋势图表 */}
      <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">过去 {rangeText.period} 趋势</CardTitle>
        </CardHeader>
        <CardContent className="px-2 md:px-6 pb-6">
          <div className="relative">
            {!hasData && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 dark:bg-neutral-900/80 rounded-lg">
                <div className="text-center">
                  <p className="text-neutral-400 text-sm">暂无数据</p>
                  <p className="text-neutral-300 text-xs mt-1">等待系统收集统计信息</p>
                </div>
              </div>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#a3a3a3"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  dy={10}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#a3a3a3"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={40}
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
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "12px",
                  }}
                  iconSize={12}
                />

                <Line
                  type="monotone"
                  dataKey="views"
                  name="阅读量"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="comments"
                  name="评论数"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="posts"
                  name="发布文章"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 生成空数据占位符（用于显示坐标轴）
function generateEmptyData() {
  const days = ["01-01", "01-02", "01-03", "01-04", "01-05"];
  return days.map((day) => ({
    date: day,
    posts: 0,
    views: 0,
    comments: 0,
  }));
}

// 保留用于向后兼容
function generateMockData() {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  return days.map((day, index) => ({
    date: day,
    posts: Math.floor(Math.random() * 3) + 1,
    views: Math.floor(Math.random() * 200) + 50,
    comments: Math.floor(Math.random() * 20) + 5,
  }));
}
