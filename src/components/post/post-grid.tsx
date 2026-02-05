import PostCard, { Post } from './post-card'
import { cn } from '@/lib/utils'

interface PostGridProps {
  posts: Post[]
  isLoading?: boolean
}

export function PostGrid({ posts, isLoading }: PostGridProps) {
  if (isLoading) {
    return (
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
                  <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-3 w-8 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse hidden sm:block" />
                </div>
                <div className="space-y-1.5 mb-2 md:mb-4">
                  <div className="h-5 md:h-7 w-full bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-5 md:h-7 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                </div>
                <div className="hidden md:block space-y-2 mb-4">
                  <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-4 w-4/6 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="mt-auto pt-0 md:pt-4 md:border-t md:border-black/[0.03] md:dark:border-white/[0.03] flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="h-4 w-12 bg-neutral-100 dark:bg-neutral-800 rounded-full animate-pulse" />
                  <div className="h-4 w-16 bg-neutral-100 dark:bg-neutral-800 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 rounded-3xl border border-dashed border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
        <p className="text-neutral-500">暂无文章</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
