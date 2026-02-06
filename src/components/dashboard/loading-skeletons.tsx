import { Card, CardContent } from "@/components/ui/card";

export function StatsCardSkeleton() {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
      <CardContent className="p-4 md:p-6">
        {/* 顶部：图标 + Live 标签 */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="w-8 h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>

        {/* 数值 + 趋势 */}
        <div className="flex items-end justify-between mb-3">
          <div className="space-y-2 flex-1">
            <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="w-14 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>

        {/* 迷你折线图 */}
        <div className="h-12 bg-neutral-100 dark:bg-neutral-800/50 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function AnalyticsTabsSkeleton() {
  return (
    <div className="space-y-6">
      {/* 标签栏 */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse"
          />
        ))}
      </div>

      {/* 内容区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 图表区域 */}
      <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl">
        <CardContent className="p-6">
          <div className="h-64 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}

export function UserManagementSkeleton() {
  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03]"
          >
            <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded mb-2 animate-pulse" />
            <div className="h-8 w-12 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* 搜索栏 */}
      <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse" />

      {/* 表格 */}
      <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03] overflow-hidden">
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                <div className="h-3 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
              </div>
              <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
