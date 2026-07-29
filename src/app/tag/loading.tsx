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

      <div className="flex min-h-[300px] flex-wrap content-start gap-4 p-4">
        {Array.from({ length: 12 }, (_, index) => (
          <div key={index} className="relative">
            <Skeleton
              className={`h-[58px] rounded-xl border border-black/5 bg-neutral-100 dark:border-white/5 dark:bg-neutral-800 ${
                index % 3 === 0 ? "w-32" : index % 3 === 1 ? "w-24" : "w-40"
              }`}
              style={{ transform: `rotate(${(index % 7) - 3}deg)` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
