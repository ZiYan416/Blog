"use client"

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import GithubSlugger from 'github-slugger'

interface TOCProps {
  content: string
  className?: string
  showTitle?: boolean
}

interface Header {
  id: string
  text: string
  level: number
}

export function TableOfContents({ content, className, showTitle = true }: TOCProps) {
  const [headers, setHeaders] = useState<Header[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // Custom smooth scroll function with easing
  const smoothScrollTo = (targetPosition: number, duration: number = 800) => {
    const startPosition = window.scrollY
    const distance = targetPosition - startPosition
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

  useEffect(() => {
    // First, remove all code blocks (both fenced and indented) to avoid extracting headers from code
    // Remove fenced code blocks (```...```)
    let cleanContent = content.replace(/```[\s\S]*?```/g, '')

    // Remove inline code (`...`)
    cleanContent = cleanContent.replace(/`[^`\n]+`/g, '')

    // Now extract headers from the cleaned content
    const regex = /^(#{1,4})\s+(.+)$/gm
    const found: Header[] = []
    let match

    // Use GithubSlugger to generate IDs identical to rehype-slug
    const slugger = new GithubSlugger()

    while ((match = regex.exec(cleanContent)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      // Use github-slugger for consistent ID generation with rehype-slug
      const id = slugger.slug(text)

      found.push({ id, text, level })
    }

    // Filter to keep only the top 2 levels
    const uniqueLevels = Array.from(new Set(found.map(h => h.level))).sort((a, b) => a - b)
    const allowedLevels = uniqueLevels.slice(0, 2)
    const filtered = found.filter(h => allowedLevels.includes(h.level))

    setHeaders(filtered)
  }, [content])

  useEffect(() => {
    if (headers.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -40% 0px' }
    )

    headers.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headers])

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showTitle && <h3 className="font-bold text-sm uppercase tracking-widest text-neutral-400 pl-3 shrink-0">目录</h3>}

      {headers.length > 0 ? (
        <ul className="space-y-1 overflow-y-auto pr-2 flex-1 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {headers.map((header) => (
            <li
              key={header.id}
              style={{ paddingLeft: `${(header.level - allowedMinLevel(headers)) * 12}px` }}
            >
              <a
                href={`#${header.id}`}
                className={cn(
                  "block py-1.5 transition-colors border-l-2 pl-3 text-sm hover:text-black dark:hover:text-white",
                  activeId === header.id
                    ? "border-amber-500 text-black dark:text-white font-medium bg-amber-50/50 dark:bg-amber-900/10 rounded-r-md"
                    : "border-transparent text-neutral-500"
                )}
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.getElementById(header.id)
                  if (element) {
                    const offset = 100 // Header height + padding
                    const elementPosition = element.getBoundingClientRect().top + window.scrollY
                    const offsetPosition = elementPosition - offset

                    // Use custom smooth scroll with easing animation
                    smoothScrollTo(offsetPosition, 800)
                    setActiveId(header.id)
                  }
                }}
              >
                {header.text}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="pl-3 text-sm text-neutral-400 italic">
          暂无目录
        </div>
      )}
    </div>
  )
}

// Helper to normalize indentation based on the minimum level present in the filtered set
function allowedMinLevel(headers: Header[]) {
  if (headers.length === 0) return 0
  return Math.min(...headers.map(h => h.level)) - 1
}
