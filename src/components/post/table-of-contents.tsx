"use client"

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TOCProps {
  content: string
  className?: string
}

interface Header {
  id: string
  text: string
  level: number
}

export function TableOfContents({ content, className }: TOCProps) {
  const [headers, setHeaders] = useState<Header[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Regex to extract headers (matches # Header, ## Header, etc.)
    const regex = /^(#{1,4})\s+(.+)$/gm
    const found: Header[] = []
    let match

    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      // Generate ID compatible with rehype-slug (lowercase, remove special chars, replace spaces with dashes)
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') // Support Chinese characters
        .replace(/^-+|-+$/g, '')

      found.push({ id, text, level })
    }
    setHeaders(found)
  }, [content])

  useEffect(() => {
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

  if (headers.length === 0) return null

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-bold text-sm uppercase tracking-widest text-neutral-400 pl-3">目录</h3>
      <ul className="space-y-1 max-h-[60vh] overflow-y-auto scrollbar-thin pr-2">
        {headers.map((header) => (
          <li
            key={header.id}
            style={{ paddingLeft: `${(header.level - 1) * 12}px` }}
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
                document.getElementById(header.id)?.scrollIntoView({ behavior: 'smooth' })
                setActiveId(header.id)
              }}
            >
              {header.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
