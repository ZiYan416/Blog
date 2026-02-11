"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  BarChart3,
  MessageSquare,
  Users
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

interface StatsCardProps {
  label: string;
  value: number;
  color: string;
  trend?: {
    value: number; // 百分比变化
    isPositive: boolean;
  };
  sparklineData?: number[]; // 7天数据
}

// 根据 label 映射图标
function getIconForLabel(label: string) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    '总文章': FileText,
    '总阅读': BarChart3,
    '总评论': MessageSquare,
    '注册用户': Users,
  };
  return iconMap[label] || FileText;
}

export function StatsCard({
  label,
  value,
  color,
  trend,
  sparklineData,
}: StatsCardProps) {
  const Icon = getIconForLabel(label);
  // 将数据转换为图表格式
  const chartData = sparklineData
    ? sparklineData.map((val, idx) => ({ value: val, index: idx }))
    : generateMockSparkline();

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden group hover:shadow-md transition-shadow">
      <CardContent className="p-4 md:p-6">
        {/* 顶部：图标 + 迷你折线图 */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          {/* 迷你折线图 - 移到右上角 */}
          <div className="h-10 w-20 opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={getColorFromClass(color)}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 数值 + 趋势 */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold mb-1">{value.toLocaleString()}</div>
            <div className="text-xs text-neutral-500 font-medium">{label}</div>
          </div>

          {/* 趋势指示器 */}
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                trend.isPositive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 从 Tailwind 类名提取颜色值
function getColorFromClass(colorClass: string): string {
  const colorMap: Record<string, string> = {
    "text-blue-500": "#3b82f6",
    "text-purple-500": "#8b5cf6",
    "text-green-500": "#10b981",
    "text-orange-500": "#f97316",
    "text-red-500": "#ef4444",
    "text-yellow-500": "#eab308",
  };
  return colorMap[colorClass] || "#8b5cf6";
}

// 生成模拟的 Sparkline 数据
function generateMockSparkline(): Array<{ value: number; index: number }> {
  return Array.from({ length: 7 }, (_, i) => ({
    value: Math.floor(Math.random() * 50) + 50,
    index: i,
  }));
}
