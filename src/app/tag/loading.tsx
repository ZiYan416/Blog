import { Skeleton } from "@/components/ui/skeleton"

export default function TagsLoading() {
  return (
    <div className="container max-w-6xl mx-auto px-6 pt-8 md:pt-12 pb-12 md:pb-20">
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <div className="space-y-2 md:space-y-4">
          <Skeleton className="h-8 md:h-10 w-32 md:w-48" />
          <Skeleton className="h-4 w-48 md:w-64" />
        </div>
      </div>

      <div className="space-y-8">
        {/* Search Toolbar Skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
          <Skeleton className="h-10 w-full sm:w-64 rounded-md" />
          <Skeleton className="h-10 w-full sm:w-32 rounded-full" />
        </div>

        <div className="flex flex-wrap content-start gap-4 p-4 min-h-[300px]">
          {/* Generate random-looking tag skeletons */}
          {[...Array(12)].map((_, i) => (
            <div key={i} className="relative">
              <Skeleton
                className={`h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-black/5 dark:border-white/5 ${
                  // Simulate varying widths
                  i % 3 === 0 ? 'w-32' : i % 3 === 1 ? 'w-24' : 'w-40'
                }`}
                style={{
                   // Simulate rotation like real tags
                   transform: `rotate(${(i % 7) - 3}deg)`
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
