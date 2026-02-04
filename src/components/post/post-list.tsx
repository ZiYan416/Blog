import PostCard, { Post } from './post-card'

interface PostListProps {
  posts: Post[]
  loading?: boolean
  error?: string
  showLoadMore?: boolean
}

export default function PostList({ posts, loading, error, showLoadMore = false }: PostListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
                  <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-3 w-8 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse hidden sm:block" />
                </div>

                {/* Title Line */}
                <div className="space-y-1.5 mb-2 md:mb-4">
                  <div className="h-5 md:h-7 w-full bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-5 md:h-7 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                </div>

                {/* Excerpt Lines (Desktop only) */}
                <div className="hidden md:block space-y-2 mb-4">
                  <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-4 w-4/6 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                </div>
              </div>

              {/* Footer Line */}
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">暂无文章</p>
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
