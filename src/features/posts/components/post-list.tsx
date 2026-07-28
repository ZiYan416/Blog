"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { PostGrid } from "./post-grid"
import type { Post } from "./post-card"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePostList } from "@/features/posts/hooks/use-post-list"

interface PostListProps {
  posts?: Post[]
  initialPosts?: Post[]
  initialTotal?: number
  category?: string
  tag?: string
  search?: string
  limit?: number
  error?: string
  header?: React.ReactNode
  extraActions?: React.ReactNode
  alignment?: "start" | "between" | "end"
}

export default function PostList({
  posts: legacyPosts,
  initialPosts,
  initialTotal = 0,
  category,
  tag,
  search,
  limit = 9,
  error,
  header,
  extraActions,
  alignment = "between",
}: PostListProps) {
  const startPosts = initialPosts || legacyPosts || []
  const startTotal = initialTotal || startPosts.length
  const list = usePostList({
    initialPosts: startPosts,
    initialTotal: startTotal,
    filters: { category, tag, search, limit },
  })
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { ref, inView } = useInView()
  const { hasMore, loading, loadMore } = list

  useEffect(() => {
    if (isDesktop || !inView || !hasMore || loading) return
    const frame = window.requestAnimationFrame(() => void loadMore())
    return () => window.cancelAnimationFrame(frame)
  }, [hasMore, inView, isDesktop, loadMore, loading])

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const totalPages = Math.ceil(list.total / limit)

  return (
    <div className="space-y-8">
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-end gap-4",
          alignment === "between"
            ? "justify-between"
            : alignment === "start"
              ? "justify-start"
              : "justify-end"
        )}
      >
        {header && (
          <div
            className={cn(
              "w-full md:w-auto",
              alignment === "between" && "flex-1"
            )}
          >
            {header}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 md:flex-none flex">{extraActions}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                aria-label="选择文章排序方式"
                className="gap-2 rounded-full h-9 md:h-10"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">排序</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>排序方式</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void list.changeSort("latest")}>
                最新发布
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void list.changeSort("oldest")}>
                最早发布
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void list.changeSort("views")}>
                最多浏览
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <PostGrid posts={list.posts} isLoading={list.loading && isDesktop} />

      {!isDesktop && (
        <div className="flex justify-center py-8" aria-live="polite">
          {list.hasMore ? (
            <div ref={ref} className="flex items-center gap-2 text-neutral-500">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span className="text-sm font-medium">加载更多...</span>
            </div>
          ) : (
            list.posts.length > 0 && (
              <p className="text-xs text-neutral-400">没有更多啦</p>
            )
          )}
        </div>
      )}

      {isDesktop && totalPages > 1 && (
        <nav
          aria-label="文章分页"
          className="flex justify-center items-center gap-4 py-8 mt-8 border-t"
        >
          <Button
            variant="outline"
            size="icon"
            aria-label="上一页"
            onClick={() => void list.changePage(list.page - 1)}
            disabled={list.page === 1 || list.loading}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-mono text-sm text-neutral-500">
            第 <strong>{list.page}</strong> 页，共 {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="下一页"
            onClick={() => void list.changePage(list.page + 1)}
            disabled={list.page === totalPages || list.loading}
            className="rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </nav>
      )}
    </div>
  )
}
