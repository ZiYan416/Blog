import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-20">
      <div className="container max-w-6xl mx-auto px-6 pt-12">
        {/* Welcome Section Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Actions Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <Skeleton className="h-7 w-32 mb-6" />
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03]">
                    <Skeleton className="w-10 h-10 rounded-full mb-4" />
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-40 w-full rounded-3xl" />
            </section>
          </div>

          {/* Sidebar Info Skeleton */}
          <div className="space-y-8">
            <Card className="border-none bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm">
              <CardContent className="p-8 space-y-6">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="h-7 w-24" />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded-full" />
              </CardContent>
            </Card>

            <Card className="border-none bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="flex gap-3">
                  <Skeleton className="w-1.5 h-1.5 rounded-full mt-1.5" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="w-1.5 h-1.5 rounded-full mt-1.5" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
