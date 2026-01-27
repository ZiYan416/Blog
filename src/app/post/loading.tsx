import { Skeleton } from "@/components/ui/skeleton"

export default function PostsLoading() {
  return (
    <div className="container max-w-6xl mx-auto px-6 pt-12 pb-20">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-3xl border border-black/[0.03] dark:border-white/[0.03] overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="pt-4">
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
