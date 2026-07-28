'use client'

import { useEffect } from 'react'
import { incrementViewCount } from '@/features/posts/actions'

export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const storageKey = `post-viewed:${slug}`

    try {
      if (sessionStorage.getItem(storageKey)) return
    } catch {
      // A blocked sessionStorage should not prevent the page from rendering.
    }

    // Avoid counting immediate bounces and duplicate React development mounts.
    const timer = window.setTimeout(async () => {
      const result = await incrementViewCount(slug)

      if (!result?.error) {
        try {
          sessionStorage.setItem(storageKey, '1')
        } catch {
          // Ignore storage restrictions after the server accepted the event.
        }
      }
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [slug])

  return null
}
