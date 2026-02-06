import {
  StatsCardSkeleton,
  AnalyticsTabsSkeleton,
  UserManagementSkeleton,
} from "@/components/dashboard/loading-skeletons";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-20">
      <div className="container max-w-6xl mx-auto px-4 pt-6 md:px-6 md:pt-12">
        {/* Header Skeleton */}
        <div className="mb-8 md:mb-12">
          <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse mb-2" />
          <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Analytics Section Skeleton */}
        <div className="mb-8">
          <AnalyticsTabsSkeleton />
        </div>

        {/* User Management Section Skeleton */}
        <div className="mb-8">
          <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-6" />
          <UserManagementSkeleton />
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-white dark:bg-neutral-900 rounded-3xl border border-black/[0.03] dark:border-white/[0.03] animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-8">
            <div className="h-64 bg-neutral-900 dark:bg-white rounded-3xl animate-pulse" />
            <div className="h-48 bg-white dark:bg-neutral-900 rounded-3xl border border-black/[0.03] dark:border-white/[0.03] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
