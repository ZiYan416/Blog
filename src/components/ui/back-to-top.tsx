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
    if (targetId) {
      const element = document.getElementById(targetId)
      if (element) {
        const offset = 80 // Header offset
        const elementPosition = element.getBoundingClientRect().top + window.scrollY
        const offsetPosition = elementPosition - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
        return
      }
    }

    // Fallback to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 transition-all duration-500 lg:hidden",
      visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
    )}>
      <Button
        onClick={scrollToTarget}
        size="icon"
        className="rounded-full h-12 w-12 bg-black/80 dark:bg-white/90 backdrop-blur-md shadow-xl border border-white/10 text-white dark:text-black hover:bg-black dark:hover:bg-white"
      >
        {targetId ? <List className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
      </Button>
    </div>
  )
}
