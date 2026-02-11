"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface UserGrowthTabProps {
  totalUsers: number;
  userGrowth?: Array<{
    date: string;
    totalUsers: number;
    newUsers: number;
  }>;
  rangeText?: {
    period: string;
    label: string;
  };
}

export function UserGrowthTab({ totalUsers, userGrowth, rangeText = { period: '7天', label: '7日' } }: UserGrowthTabProps) {
  // 使用真实数据或生成模拟数据
  const growthData = userGrowth || generateUserGrowthData();
  const newUsersData = userGrowth || generateNewUsersData();

  // 计算统计数据
  const totalNewUsers = newUsersData.reduce((sum, day) => sum + (day.newUsers || 0), 0);
  const avgNewUsersPerDay = Math.round(totalNewUsers / newUsersData.length);
  const growthRate = totalUsers > 0 ? ((totalNewUsers / totalUsers) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-2xl bg-blue-500/10">
                <Users className="w-4 h-4 md:w-6 md:h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold">{totalUsers}</div>
                <div className="text-[10px] md:text-xs text-neutral-500">累计用户</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-2xl bg-green-500/10">
                <UserPlus className="w-4 h-4 md:w-6 md:h-6 text-green-500" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold">{totalNewUsers}</div>
                <div className="text-[10px] md:text-xs text-neutral-500">{rangeText.label}新增</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 rounded-2xl bg-purple-500/10">
                <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold">{growthRate}%</div>
                <div className="text-[10px] md:text-xs text-neutral-500">增长率</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 累计用户增长曲线 */}
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">用户增长趋势</CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6 pb-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={growthData} margin={{ top: 5, right: 15, left: -15, bottom: -30 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="totalUsers"
                  name="累计用户"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 每日新增用户柱状图 */}
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">每日新增用户</CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6 pb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={newUsersData} margin={{ top: 5, right: 15, left: -15, bottom: -30 }}>
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
                <Bar
                  dataKey="newUsers"
                  name="新增用户"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 活跃用户统计 */}
      <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">活跃用户统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/50">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(totalUsers * 0.15)}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                日活跃用户 (DAU)
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200/50 dark:border-purple-800/50">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(totalUsers * 0.45)}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                周活跃用户 (WAU)
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-200/50 dark:border-green-800/50">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round(totalUsers * 0.68)}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                月活跃用户 (MAU)
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200/50 dark:border-orange-800/50">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {avgNewUsersPerDay}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                日均新增
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 生成模拟的累计用户增长数据
function generateUserGrowthData() {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  let cumulative = 100;
  return days.map((day) => {
    cumulative += Math.floor(Math.random() * 5) + 2;
    return {
      date: day,
      totalUsers: cumulative,
    };
  });
}

// 生成模拟的每日新增用户数据
function generateNewUsersData() {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  return days.map((day) => ({
    date: day,
    newUsers: Math.floor(Math.random() * 5) + 2,
  }));
}
