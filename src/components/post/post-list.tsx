"use client"

import { useState, useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { PostGrid } from "./post-grid"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, ArrowUpDown } from "lucide-react"
import { Post } from "./post-card"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PostListProps {
  // Support both old prop (posts) for backward compatibility if needed,
  // but we should migrate to initialPosts
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
  alignment?: 'start' | 'between' | 'end'
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
  alignment = 'between'
}: PostListProps) {
  // Use initialPosts if available, otherwise fall back to legacy posts
  const startPosts = initialPosts || legacyPosts || []
  const startTotal = initialTotal || startPosts.length

  const [posts, setPosts] = useState<Post[]>(startPosts)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(startTotal)
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState<'latest' | 'oldest' | 'views'>('latest')

  // AbortController ref to handle race conditions and unmounts
  const abortControllerRef = useRef<AbortController | null>(null)

  // For mobile infinite scroll
  const [hasMore, setHasMore] = useState(startPosts.length < startTotal)

  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { ref, inView } = useInView()

  // Reset state when filters or initial data change
  useEffect(() => {
    const currentPosts = initialPosts || legacyPosts || []
    const currentTotal = initialTotal || currentPosts.length

    setPosts(currentPosts)
    setTotal(currentTotal)
    setPage(1)
    setHasMore(currentPosts.length < currentTotal)
    setSort('latest')

    // Cleanup abort controller on unmount or deps change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [initialPosts, legacyPosts, initialTotal, category, tag, search])

  // Mobile Infinite Scroll Effect
  useEffect(() => {
    if (!isDesktop && inView && hasMore && !loading) {
      loadMoreMobile()
    }
  }, [inView, isDesktop, hasMore, loading])

  const loadMoreMobile = async () => {
    // Prevent duplicate requests
    if (loading) return

    setLoading(true)

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    const nextPage = page + 1
    const params = new URLSearchParams({
      page: nextPage.toString(),
      limit: limit.toString(),
      sort,
    })

    if (category) params.append("category", category)
    if (tag) params.append("tag", tag)
    if (search) params.append("search", search)

    try {
      const res = await fetch(`/api/posts?${params.toString()}`, {
        signal: controller.signal
      })
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      if (data.posts && data.posts.length > 0) {
        setPosts(prev => {
           // Filter out duplicates just in case
           const existingIds = new Set(prev.map(p => p.id))
           const newPosts = data.posts.filter((p: Post) => !existingIds.has(p.id))
           return [...prev, ...newPosts]
        })
        setPage(nextPage)
        setTotal(data.total || 0)
        setHasMore((posts.length + data.posts.length) < (data.total || 0))
      } else {
        setHasMore(false)
      }
    } catch (error: any) {
      // Ignore abort errors which happen on rapid navigation/filtering
      if (error.name === 'AbortError' || error.message === 'The user aborted a request.') return

      console.error("Failed to load posts", error)
      // Only set error state if it's not a cancellation
      // setHasMore(false) // Optional: stop trying?
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
        setLoading(false)
      }
    }
  }

  const handlePageChange = async (newPage: number) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    const params = new URLSearchParams({
      page: newPage.toString(),
      limit: limit.toString(),
      sort,
    })

    if (category) params.append("category", category)
    if (tag) params.append("tag", tag)
    if (search) params.append("search", search)

    try {
      const res = await fetch(`/api/posts?${params.toString()}`, {
        signal: controller.signal
      })
      const data = await res.json()

      if (data.error) throw new Error(data.error)
      const newPosts = data.posts || []

      setPosts(newPosts)
      setPage(newPage)
      setTotal(data.total || 0)
      setHasMore(newPosts.length === limit)

      // Scroll to top of list
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error: any) {
      if (error.name === 'AbortError') return
      console.error("Failed to load page", error)
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
        setLoading(false)
      }
    }
  }

  const handleSortChange = async (newSort: 'latest' | 'oldest' | 'views') => {
    if (sort === newSort) return

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setSort(newSort)
    setLoading(true)

    const params = new URLSearchParams({
      page: "1",
      limit: limit.toString(),
      sort: newSort,
    })

    if (category) params.append("category", category)
    if (tag) params.append("tag", tag)
    if (search) params.append("search", search)

    try {
      const res = await fetch(`/api/posts?${params.toString()}`, {
        signal: controller.signal
      })
      const data = await res.json()

      if (data.error) throw new Error(data.error)
      const newPosts = data.posts || []

      setPosts(newPosts)
      setPage(1)
      setTotal(data.total || 0)
      setHasMore(newPosts.length < (data.total || 0))

      // Scroll to top of list
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error: any) {
      if (error.name === 'AbortError') return
      console.error("Failed to load sorted posts", error)
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
        setLoading(false)
      }
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-8">
      {/* Header & Controls Section */}
      <div className={cn(
        "flex flex-col md:flex-row md:items-end gap-4",
        alignment === 'between' ? "justify-between" :
        alignment === 'start' ? "justify-start" : "justify-end"
      )}>
        {header && (
          <div className={cn(
            "w-full md:w-auto",
            alignment === 'between' && "flex-1"
          )}>
            {header}
          </div>
        )}

        <div className={cn(
          "flex items-center gap-3",
          (header && alignment === 'between') ? "w-full md:w-auto" :
          (!header && alignment === 'between') ? "w-full justify-end" : ""
        )}>
          {/* Extra Actions (e.g., New Post Button) */}
          <div className="flex-1 md:flex-none flex">
            {extraActions}
          </div>

           {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-full border-black/10 dark:border-white/10 h-9 md:h-10">
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">排序</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>排序方式</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSortChange('latest')}>
                最新发布
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('oldest')}>
                最早发布
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('views')}>
                最多浏览
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <PostGrid posts={posts} isLoading={loading && isDesktop} />

      {/* Mobile Loading Trigger (Infinite Scroll) */}
      {!isDesktop && (
        <div className="flex justify-center py-8">
           {hasMore ? (
             <div ref={ref} className="flex items-center gap-2 text-neutral-500 bg-white dark:bg-neutral-900 px-4 py-2 rounded-full border border-black/5 dark:border-white/5 shadow-sm">
               <Loader2 className="w-4 h-4 animate-spin" />
               <span className="text-sm font-medium">加载更多...</span>
             </div>
           ) : (
             posts.length > 0 && (
               <p className="text-xs text-neutral-400 font-medium uppercase tracking-widest">
                 没有更多啦
               </p>
             )
           )}
        </div>
      )}

      {/* Desktop Pagination */}
      {isDesktop && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-8 mt-8 border-t border-black/5 dark:border-white/5 pt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
              className="rounded-full w-10 h-10 border-black/10 dark:border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="flex items-center px-4 font-mono text-sm text-neutral-500">
               Page <span className="text-black dark:text-white font-bold mx-2">{page}</span> of {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading}
              className="rounded-full w-10 h-10 border-black/10 dark:border-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
      )}
    </div>
  )
}
