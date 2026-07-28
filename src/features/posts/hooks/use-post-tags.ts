"use client"

import { useCallback, useEffect, useState } from "react"
import { getTagNames } from "@/features/tags/actions"

export function usePostTags() {
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [loadingTags, setLoadingTags] = useState(false)

  const refreshTags = useCallback(async () => {
    setLoadingTags(true)
    try {
      setAvailableTags(await getTagNames())
    } catch (error) {
      console.error("Error fetching tags:", error)
    } finally {
      setLoadingTags(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshTags(), 0)
    return () => window.clearTimeout(timer)
  }, [refreshTags])

  return { availableTags, loadingTags, refreshTags }
}
