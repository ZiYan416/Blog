import Link from "next/link"
import { Tag } from "lucide-react"
import { getTagStyles } from "@/lib/tag-color"

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
  if (tags.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>暂无标签</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-4">
      {tags.map((tag) => {
        const styles = getTagStyles(tag.name)
        return (
          <Link
            key={tag.id}
            href={`/tag/${tag.slug}`}
            className="group"
          >
            <div
              className="relative overflow-hidden backdrop-blur-md flex items-center gap-2 px-5 py-3 rounded-2xl transition-all hover:scale-105 duration-300 hover:shadow-lg"
              style={{
                backgroundColor: styles.backgroundColor,
                borderColor: styles.borderColor,
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 dark:from-white/20 to-transparent pointer-events-none" />

              <Tag
                className="w-4 h-4 relative z-10 transition-colors"
                style={{ color: styles.color }}
              />
              <span className="font-medium text-neutral-700 dark:text-neutral-100 relative z-10">
                {tag.name}
              </span>
              {tag.post_count > 0 && (
                <span className="relative z-10 ml-1 text-xs px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 text-neutral-600 dark:text-neutral-300">
                  {tag.post_count}
                </span>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}