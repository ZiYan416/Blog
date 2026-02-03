import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PostLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-20">
      {/* Hero Header Skeleton */}
      <div className="relative w-full h-[30vh] min-h-[250px] md:h-[35vh] md:min-h-[300px] bg-neutral-900 dark:bg-black overflow-hidden">
        <div className="absolute inset-0 bg-neutral-800 animate-pulse" />

        <div className="container max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-16 md:pb-24 relative z-10">
          <Button variant="ghost" disabled className="absolute top-8 left-6 text-white/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>

          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4 bg-white/10" />

            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-32 rounded-full bg-white/10" />
              <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
              <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main Content Skeleton */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-10 shadow-xl border border-black/5 dark:border-white/5 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            <Skeleton className="h-64 w-full rounded-xl my-8" />

            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5 sticky top-24">
              <Skeleton className="h-4 w-24 mb-6" />
              <div className="flex flex-col items-center">
                <Skeleton className="w-20 h-20 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
