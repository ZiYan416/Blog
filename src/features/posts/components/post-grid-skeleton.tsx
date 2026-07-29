import { Skeleton } from "@/components/ui/skeleton"

interface PostGridSkeletonProps {
  count?: number
}

export function PostGridSkeleton({ count = 9 }: PostGridSkeletonProps) {
  return (
    <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="relative flex h-32 flex-row overflow-hidden rounded-2xl border border-black/[0.03] bg-white dark:border-white/[0.03] dark:bg-neutral-900 md:h-auto md:flex-col md:rounded-[2.5rem]"
        >
          <div className="relative order-last w-[35%] shrink-0 animate-pulse bg-neutral-100 dark:bg-neutral-800 md:order-first md:aspect-[16/10] md:w-full" />

          <div className="flex min-w-0 flex-1 flex-col justify-between p-4 md:p-6">
            <div className="w-full">
              <div className="mb-2 flex items-center gap-3 md:mb-4">
                <Skeleton className="h-3 w-16 rounded bg-neutral-100 dark:bg-neutral-800" />
                <Skeleton className="hidden h-3 w-8 rounded bg-neutral-100 dark:bg-neutral-800 sm:block" />
              </div>

              <div className="mb-2 space-y-1.5 md:mb-4">
                <Skeleton className="h-5 w-full rounded bg-neutral-100 dark:bg-neutral-800 md:h-7" />
                <Skeleton className="h-5 w-2/3 rounded bg-neutral-100 dark:bg-neutral-800 md:h-7" />
              </div>

              <div className="mb-4 hidden space-y-2 md:block">
                <Skeleton className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
                <Skeleton className="h-4 w-5/6 rounded bg-neutral-100 dark:bg-neutral-800" />
                <Skeleton className="h-4 w-4/6 rounded bg-neutral-100 dark:bg-neutral-800" />
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-0 md:border-t md:border-black/[0.03] md:pt-4 md:dark:border-white/[0.03]">
              <div className="flex gap-2">
                <Skeleton className="h-4 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                <Skeleton className="h-4 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
