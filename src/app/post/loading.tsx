import { Skeleton } from "@/components/ui/skeleton"
import { PostGridSkeleton } from "@/features/posts/components/post-grid-skeleton"

export default function PostsLoading() {
  return (
    <div className="container max-w-6xl mx-auto px-6 pt-8 md:pt-12 pb-12 md:pb-20">
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="w-full space-y-2 md:w-auto md:flex-1 md:space-y-4">
            <Skeleton className="h-8 w-32 md:h-10 md:w-48" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-10 rounded-full md:h-10" />
          </div>
        </div>

        <PostGridSkeleton />
      </div>
    </div>
  )
}
