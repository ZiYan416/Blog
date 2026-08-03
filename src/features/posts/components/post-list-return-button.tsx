"use client"

import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  POST_DETAIL_HISTORY_ENTRY_KEY,
  POST_LIST_RETURN_STATE_KEY,
  readPostListReturnState,
} from "@/features/posts/post-list-return-state"

function getHistoryState() {
  const state = window.history.state
  return state && typeof state === "object"
    ? (state as Record<string, unknown>)
    : {}
}

function claimCurrentDetailEntry() {
  const saved = readPostListReturnState()
  if (!saved || saved.detailPathname !== window.location.pathname) return null

  if (saved.detailEntryKey) return saved

  const detailEntryKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const claimed = { ...saved, detailEntryKey }
  sessionStorage.setItem(POST_LIST_RETURN_STATE_KEY, JSON.stringify(claimed))
  window.history.replaceState(
    {
      ...getHistoryState(),
      [POST_DETAIL_HISTORY_ENTRY_KEY]: detailEntryKey,
    },
    "",
    window.location.href
  )
  return claimed
}

export function PostListReturnButton() {
  const router = useRouter()

  useEffect(() => {
    claimCurrentDetailEntry()
  }, [])

  const handleReturn = useCallback(() => {
    const saved = claimCurrentDetailEntry()
    const isClaimedEntry =
      saved?.detailEntryKey &&
      getHistoryState()[POST_DETAIL_HISTORY_ENTRY_KEY] === saved.detailEntryKey

    if (isClaimedEntry) {
      router.back()
      return
    }

    sessionStorage.removeItem(POST_LIST_RETURN_STATE_KEY)
    router.push("/post")
  }, [router])

  return (
    <Button
      variant="ghost"
      onClick={handleReturn}
      className="post-hero-supporting h-10 w-auto gap-2 rounded-full bg-black/50 px-4 text-white backdrop-blur-md hover:bg-white/20 hover:text-white md:bg-transparent md:backdrop-blur-none"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="text-sm font-medium">返回列表</span>
    </Button>
  )
}
