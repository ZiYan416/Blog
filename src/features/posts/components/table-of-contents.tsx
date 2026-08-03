"use client"

import { useEffect, useMemo, useState } from 'react'
import GithubSlugger from 'github-slugger'
import { cn } from '@/lib/utils'
import { normalizeMarkdownBlockBoundaries } from '@/features/posts/markdown-normalization'

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

function extractHeaders(content: string): Header[] {
  const cleanContent = normalizeMarkdownBlockBoundaries(content)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]+`/g, '')
  const regex = /^(#{1,4})\s+(.+)$/gm
  const found: Header[] = []
  const slugger = new GithubSlugger()
  let match: RegExpExecArray | null

  while ((match = regex.exec(cleanContent)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    found.push({ id: slugger.slug(text), text, level })
  }

  const allowedLevels = Array.from(new Set(found.map((header) => header.level)))
    .sort((a, b) => a - b)
    .slice(0, 2)

  return found.filter((header) => allowedLevels.includes(header.level))
}

function allowedMinLevel(headers: Header[]) {
  if (headers.length === 0) return 0
  return Math.min(...headers.map((header) => header.level)) - 1
}

export function TableOfContents({ content, className, showTitle = true }: TOCProps) {
  const headers = useMemo(() => extractHeaders(content), [content])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    if (headers.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-100px 0px -40% 0px' },
    )

    headers.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headers])

  const smoothScrollTo = (targetPosition: number, duration = 800) => {
    const startPosition = window.scrollY
    const distance = targetPosition - startPosition
    let startTime: number | null = null

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress < 0.5
        ? 4 * progress ** 3
        : 1 - ((-2 * progress + 2) ** 3) / 2

      window.scrollTo(0, startPosition + distance * eased)
      if (elapsed < duration) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showTitle && (
        <h3 className="font-bold text-sm uppercase tracking-widest text-neutral-400 pl-3 shrink-0">
          目录
        </h3>
      )}

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
                    : "border-transparent text-neutral-500",
                )}
                onClick={(event) => {
                  event.preventDefault()
                  const element = document.getElementById(header.id)
                  if (!element) return

                  const position = element.getBoundingClientRect().top + window.scrollY - 100
                  smoothScrollTo(position)
                  setActiveId(header.id)
                }}
              >
                {header.text}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="pl-3 text-sm text-neutral-400 italic">暂无目录</div>
      )}
    </div>
  )
}
