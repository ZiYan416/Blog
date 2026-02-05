import { Skeleton } from "@/components/ui/skeleton"

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

      {/* Content Skeleton */}
      <div className="container max-w-6xl mx-auto px-6">
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="group relative bg-white dark:bg-neutral-900 rounded-2xl md:rounded-[2.5rem] border border-black/[0.03] dark:border-white/[0.03] flex flex-row md:flex-col overflow-hidden h-32 md:h-auto"
            >
              {/* Image Skeleton */}
              <div className="relative w-[35%] md:w-full md:aspect-[16/10] shrink-0 order-last md:order-first bg-neutral-100 dark:bg-neutral-800 animate-pulse" />

              {/* Content Skeleton */}
              <div className="p-4 md:p-6 flex flex-col flex-1 justify-between min-w-0">
                <div className="w-full">
                  <div className="flex items-center gap-3 mb-2 md:mb-4">
                    <Skeleton className="h-3 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" />
                    <Skeleton className="h-3 w-8 bg-neutral-100 dark:bg-neutral-800 rounded hidden sm:block" />
                  </div>
                  <div className="space-y-1.5 mb-2 md:mb-4">
                    <Skeleton className="h-5 md:h-7 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
                    <Skeleton className="h-5 md:h-7 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded" />
                  </div>
                  <div className="hidden md:block space-y-2 mb-4">
                    <Skeleton className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
                    <Skeleton className="h-4 w-5/6 bg-neutral-100 dark:bg-neutral-800 rounded" />
                  </div>
                </div>
                <div className="mt-auto pt-0 md:pt-4 md:border-t md:border-black/[0.03] md:dark:border-white/[0.03] flex items-center justify-between">
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-12 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                    <Skeleton className="h-4 w-16 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
