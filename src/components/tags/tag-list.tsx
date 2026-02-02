"use client"

import Link from "next/link"
import { Tag } from "lucide-react"
import { getTagStyles } from "@/lib/tag-color"
import { cn } from "@/lib/utils"

interface TagItem {
  id: string
  name: string
  slug: string
  post_count: number
  color?: string
}

interface TagListProps {
  tags: TagItem[]
}

export function TagList({ tags }: TagListProps) {
  // Generate a deterministic rotation based on string hash
  const getRotation = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    // Returns a number between -3 and 3
    return (hash % 7) - 3
  }

  if (tags.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>暂无标签</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap content-start gap-4 p-4 min-h-[300px]">
      {tags.map((tag) => {
        const rotation = getRotation(tag.id)
        const styles = getTagStyles(tag.name)

        return (
          <div
            key={tag.id}
            className="group relative"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <Link
              href={`/tag/${tag.slug}`}
              className={cn(
                "relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300",
                // Removed 'backdrop-blur-md' from here to prevent content blurring
                // Added overflow-hidden to ensure the backdrop layer stays inside
                "shadow-sm overflow-hidden",
                "group-hover:scale-105 group-hover:rotate-0 group-hover:shadow-md group-hover:z-10",
                "cursor-pointer"
              )}
              style={{
                backgroundColor: styles.backgroundColor,
                borderColor: styles.borderColor,
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              {/* Separate backdrop blur layer that sits BEHIND content via z-index */}
              {/* Note: In CSS, backdrop-filter applies to the element's background area.
                  If we put it on a child div with absolute positioning, it blurs what is BEHIND that child div.
                  To avoid blurring the text (which is a sibling or child), we ensure this layer is underneath.
              */}
              <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-md -z-10" />

              <Tag
                className="w-4 h-4 opacity-70 relative z-10"
                style={{ color: styles.color }}
              />
              <span className="text-lg font-bold relative z-10" style={{ color: styles.color }}>
                {tag.name}
              </span>

              {tag.post_count > 0 && (
                <span className="relative z-10 text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 text-neutral-800 dark:text-neutral-200">
                  {tag.post_count}
                </span>
              )}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
