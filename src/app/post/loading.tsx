import { Skeleton } from "@/components/ui/skeleton"

export default function PostsLoading() {
  return (
    <div className="container max-w-6xl mx-auto px-6 pt-8 md:pt-12 pb-12 md:pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
        <div className="space-y-2 md:space-y-4">
          <Skeleton className="h-8 md:h-10 w-32 md:w-48" />
          <Skeleton className="h-4 w-64 md:w-96" />
        </div>
        <Skeleton className="h-10 w-full md:w-32 rounded-full" />
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="group relative bg-white dark:bg-neutral-900 rounded-2xl md:rounded-[2.5rem] border border-black/[0.03] dark:border-white/[0.03] flex flex-row md:flex-col overflow-hidden h-32 md:h-auto"
          >
            {/* Image Skeleton - Mobile: Right, Desktop: Top */}
            <div className="relative w-[35%] md:w-full md:aspect-[16/10] shrink-0 order-last md:order-first bg-neutral-100 dark:bg-neutral-800 animate-pulse" />

            {/* Content Skeleton */}
            <div className="p-4 md:p-6 flex flex-col flex-1 justify-between min-w-0">
              <div className="w-full">
                {/* Meta Line */}
                <div className="flex items-center gap-3 mb-2 md:mb-4">
                  <Skeleton className="h-3 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" />
                  <Skeleton className="h-3 w-8 bg-neutral-100 dark:bg-neutral-800 rounded hidden sm:block" />
                </div>

                {/* Title Line */}
                <div className="space-y-1.5 mb-2 md:mb-4">
                  <Skeleton className="h-5 md:h-7 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
                  <Skeleton className="h-5 md:h-7 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded" />
                </div>

                {/* Excerpt Lines (Desktop only) */}
                <div className="hidden md:block space-y-2 mb-4">
                  <Skeleton className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
                  <Skeleton className="h-4 w-5/6 bg-neutral-100 dark:bg-neutral-800 rounded" />
                  <Skeleton className="h-4 w-4/6 bg-neutral-100 dark:bg-neutral-800 rounded" />
                </div>
              </div>

              {/* Footer Line */}
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
  )
}
