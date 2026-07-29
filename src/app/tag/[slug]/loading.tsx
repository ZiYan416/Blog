import { Skeleton } from "@/components/ui/skeleton"
import { PostGridSkeleton } from "@/features/posts/components/post-grid-skeleton"

export default function TagDetailLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-12 md:pb-20">
      {/* Header Skeleton */}
      <div className="relative overflow-hidden py-12 md:py-20 mb-8 md:mb-12 bg-neutral-100 dark:bg-neutral-900 border-b border-black/5 dark:border-white/5">
        <div className="container relative z-10 max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
            <Skeleton className="h-4 md:h-5 w-24 md:w-32" />
          </div>
          <Skeleton className="h-8 md:h-14 w-48 md:w-80 mb-3 md:mb-4" />
          <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-6">
        <PostGridSkeleton />
      </div>
    </div>
  )
}
