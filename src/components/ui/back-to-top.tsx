"use client"

import { useState, useEffect } from 'react'
import { ArrowUp, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface BackToTopProps {
  targetId?: string
  threshold?: number
}

export function BackToTop({ targetId, threshold = 400 }: BackToTopProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY
      setVisible(currentScroll > threshold)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  const scrollToTarget = () => {
    let targetPosition = 0

    if (targetId) {
      const element = document.getElementById(targetId)
      if (element) {
        const offset = 80
        const elementPosition = element.getBoundingClientRect().top + window.scrollY
        targetPosition = elementPosition - offset
      }
    }

    const startPosition = window.scrollY
    const distance = targetPosition - startPosition
    const duration = 1000 // 1秒动画时长
    let startTime: number | null = null

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      const ease = easeInOutCubic(progress)

      window.scrollTo(0, startPosition + distance * ease)

      if (timeElapsed < duration) {
        requestAnimationFrame(animation)
      }
    }

    requestAnimationFrame(animation)
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 transition-all duration-500 lg:hidden",
      visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95 pointer-events-none"
    )}>
      <Button
        onClick={scrollToTarget}
        size="icon"
        className="rounded-full h-12 w-12 bg-neutral-100/90 dark:bg-neutral-800/90 backdrop-blur-md shadow-xl border border-black/[0.08] dark:border-white/[0.08] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {targetId ? <List className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
      </Button>
    </div>
  )
}
