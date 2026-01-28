'use client'

import { useEffect } from 'react'
import { incrementViewCount } from '@/app/actions/post'

export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    // Increment view count on mount (page load)
    // We use a timeout to avoid counting immediate bounces or double-fires in React Strict Mode dev
    const timer = setTimeout(() => {
      incrementViewCount(slug)
    }, 1000)

    return () => clearTimeout(timer)
  }, [slug])

  return null // This component doesn't render anything
}
