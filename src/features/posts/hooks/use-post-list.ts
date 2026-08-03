"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Post } from "@/features/posts/components/post-card"
import { isAbortError } from "@/lib/errors"
import {
  LEGACY_POST_LIST_STATE_KEYS,
  POST_LIST_HISTORY_ENTRY_KEY,
  POST_LIST_RETURN_STATE_KEY,
  readPostListReturnState,
  type PostSort,
} from "@/features/posts/post-list-return-state"

export type { PostSort } from "@/features/posts/post-list-return-state"

function getHistoryState() {
  const state = window.history.state
  return state && typeof state === "object"
    ? (state as Record<string, unknown>)
    : {}
}

function clearPostListHistoryMarker() {
  const state = { ...getHistoryState() }
  delete state[POST_LIST_HISTORY_ENTRY_KEY]
  window.history.replaceState(state, "", window.location.href)
}

interface PostListFilters {
  category?: string
  tag?: string
  search?: string
  limit: number
}

interface PostPageResponse {
  posts?: Post[]
  total?: number
  error?: string
}

export function usePostList({
  initialPosts,
  initialTotal,
  filters,
}: {
  initialPosts: Post[]
  initialTotal: number
  filters: PostListFilters
}) {
  const [posts, setPosts] = useState(initialPosts)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(initialTotal)
  const [sort, setSort] = useState<PostSort>("latest")
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length < initialTotal)
  const controllerRef = useRef<AbortController | null>(null)

  const buildParams = useCallback(
    (targetPage: number, targetSort: PostSort) => {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(filters.limit),
        sort: targetSort,
      })
      if (filters.category) params.set("category", filters.category)
      if (filters.tag) params.set("tag", filters.tag)
      if (filters.search) params.set("search", filters.search)
      return params
    },
    [filters.category, filters.limit, filters.search, filters.tag]
  )

  const requestPage = useCallback(
    async (targetPage: number, targetSort: PostSort) => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller
      setLoading(true)

      try {
        const response = await fetch(
          `/api/posts?${buildParams(targetPage, targetSort)}`,
          { signal: controller.signal }
        )
        const result = (await response.json()) as PostPageResponse
        if (!response.ok || result.error) {
          throw new Error(result.error || "文章列表加载失败")
        }
        return {
          posts: result.posts || [],
          total: result.total || 0,
        }
      } catch (error) {
        if (!isAbortError(error)) {
          console.error("Failed to load posts", error)
        }
        return null
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null
          setLoading(false)
        }
      }
    },
    [buildParams]
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPosts(initialPosts)
      setTotal(initialTotal)
      setPage(1)
      setSort("latest")
      setHasMore(initialPosts.length < initialTotal)
    }, 0)

    return () => {
      window.clearTimeout(timer)
      controllerRef.current?.abort()
    }
  }, [initialPosts, initialTotal])

  useEffect(() => {
    const rememberListState = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest("a")
      const href = anchor?.getAttribute("href")
      if (!href?.startsWith("/post/") || anchor?.target === "_blank") {
        return
      }

      const returnKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      window.history.replaceState(
        {
          ...getHistoryState(),
          [POST_LIST_HISTORY_ENTRY_KEY]: returnKey,
        },
        "",
        window.location.href
      )
      sessionStorage.setItem(
        POST_LIST_RETURN_STATE_KEY,
        JSON.stringify({
          page,
          sort,
          scrollY: window.scrollY,
          pathname: window.location.pathname,
          detailPathname: new URL(href, window.location.origin).pathname,
          returnKey,
        })
      )
    }

    document.addEventListener("click", rememberListState, true)
    return () => document.removeEventListener("click", rememberListState, true)
  }, [page, sort])

  useEffect(() => {
    const restore = async () => {
      const scrollTo = (top: number) => {
        window.requestAnimationFrame(() =>
          window.scrollTo({ top, behavior: "instant" })
        )
      }

      try {
        LEGACY_POST_LIST_STATE_KEYS.forEach((key) => sessionStorage.removeItem(key))
        const saved = readPostListReturnState()
        if (!saved) {
          sessionStorage.removeItem(POST_LIST_RETURN_STATE_KEY)
          scrollTo(0)
          return
        }
        sessionStorage.removeItem(POST_LIST_RETURN_STATE_KEY)
        if (saved.pathname !== window.location.pathname) {
          scrollTo(0)
          return
        }
        if (
          !saved.returnKey ||
          getHistoryState()[POST_LIST_HISTORY_ENTRY_KEY] !== saved.returnKey
        ) {
          scrollTo(0)
          return
        }
        clearPostListHistoryMarker()

        const targetPage = saved.page
        const targetSort = saved.sort
        if (targetPage > 1 || targetSort !== "latest") {
          const result = await requestPage(targetPage, targetSort)
          if (result) {
            setPosts(result.posts)
            setTotal(result.total)
            setPage(targetPage)
            setSort(targetSort)
            setHasMore(result.posts.length < result.total)
          }
        }
        scrollTo(saved.scrollY)
      } catch (error) {
        console.error("Error restoring post list state", error)
        scrollTo(0)
      }
    }

    void restore()
  }, [requestPage])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    const targetPage = page + 1
    const result = await requestPage(targetPage, sort)
    if (!result) return

    setPosts((current) => {
      const existingIds = new Set(current.map((post) => post.id))
      return [
        ...current,
        ...result.posts.filter((post) => !existingIds.has(post.id)),
      ]
    })
    setPage(targetPage)
    setTotal(result.total)
    setHasMore(page * filters.limit + result.posts.length < result.total)
  }, [filters.limit, hasMore, loading, page, requestPage, sort])

  const changePage = useCallback(
    async (targetPage: number) => {
      const result = await requestPage(targetPage, sort)
      if (!result) return

      setPosts(result.posts)
      setTotal(result.total)
      setPage(targetPage)
      setHasMore(result.posts.length < result.total)
      const url = new URL(window.location.href)
      url.searchParams.set("page", String(targetPage))
      window.history.replaceState(null, "", url)
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [requestPage, sort]
  )

  const changeSort = useCallback(
    async (nextSort: PostSort) => {
      if (nextSort === sort) return
      setSort(nextSort)
      const result = await requestPage(1, nextSort)
      if (!result) return

      setPosts(result.posts)
      setTotal(result.total)
      setPage(1)
      setHasMore(result.posts.length < result.total)
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [requestPage, sort]
  )

  const removePost = useCallback((postId: string) => {
    setPosts((current) => current.filter((post) => post.id !== postId))
    setTotal((current) => Math.max(0, current - 1))
  }, [])

  return {
    posts,
    page,
    total,
    sort,
    loading,
    hasMore,
    loadMore,
    changePage,
    changeSort,
    removePost,
  }
}
