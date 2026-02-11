"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Clock, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EngagementTabProps {
  totalComments: number;
  totalViews: number;
  commentTrend?: Array<{
    date: string;
    comments: number;
  }>;
  topCommenters?: Array<{
    name: string;
    count: number;
    lastComment: string;
  }>;
  rangeText?: {
    period: string;
    label: string;
  };
}

export function EngagementTab({
  totalComments,
  totalViews,
  commentTrend,
  topCommenters,
  rangeText = { period: '7天', label: '7日' }
}: EngagementTabProps) {
  // 使用真实数据或生成模拟数据
  const commentTrendData = commentTrend || generateCommentTrendData();
  const topCommentersData = topCommenters || generateTopCommenters();

  // 计算统计指标
  const engagementRate = totalViews > 0
    ? ((totalComments / totalViews) * 100).toFixed(2)
    : "0.00";

  // 修复 NaN 问题：添加安全检查
  const avgCommentsPerDay = commentTrendData.length > 0
    ? Math.round(
        commentTrendData.reduce((sum, day) => sum + (day.comments || 0), 0) / commentTrendData.length
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-green-500/10">
                <MessageSquare className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalComments}</div>
                <div className="text-xs text-neutral-500">总评论数</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-purple-500/10">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{engagementRate}%</div>
                <div className="text-xs text-neutral-500">互动率</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{avgCommentsPerDay}</div>
                <div className="text-xs text-neutral-500">日均评论</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 评论趋势图 */}
      <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">评论趋势</CardTitle>
        </CardHeader>
        <CardContent className="px-2 md:px-6 pb-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={commentTrendData} margin={{ top: 5, right: 15, left: -15, bottom: -30 }}>
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
              <Line
                type="monotone"
                dataKey="comments"
                name="评论数"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 高频评论者 */}
      <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">高频评论者 Top 5</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCommentersData.map((commenter, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : index === 1
                      ? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                      : index === 2
                      ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{commenter.name}</div>
                  <div className="text-xs text-neutral-500">
                    最近评论：{commenter.lastComment}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{commenter.count}</div>
                  <div className="text-xs text-neutral-500">条评论</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 生成模拟的评论趋势数据（仅作为空数据时的占位符）
function generateCommentTrendData() {
  const days = ["01-01", "01-02", "01-03", "01-04", "01-05"];
  return days.map((day) => ({
    date: day,
    comments: 0,
  }));
}

// 生成模拟的高频评论者数据（仅作为空数据时的占位符）
function generateTopCommenters() {
  return []
}
