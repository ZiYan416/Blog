import PostCard, { Post } from './post-card'
import { PostGridSkeleton } from './post-grid-skeleton'

interface PostGridProps {
  posts: Post[]
  isLoading?: boolean
}

export function PostGrid({ posts, isLoading }: PostGridProps) {
  if (isLoading) {
    return <PostGridSkeleton />
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
