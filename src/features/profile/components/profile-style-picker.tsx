"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronUp, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CARD_STYLES } from "@/lib/card-styles"
import { cn } from "@/lib/utils"

export function ProfileStylePicker({
  value,
  onChange,
  columns = "grid-cols-2",
}: {
  value: string
  onChange: (value: string) => void
  columns?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const styles = Object.entries(CARD_STYLES)
  const visibleStyles = expanded ? styles : styles.slice(0, 6)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Palette className="w-4 h-4 text-neutral-500" aria-hidden="true" />
        名片背景风格
      </h3>
      <div className={cn("grid gap-3", columns)}>
        <AnimatePresence initial={false} mode="popLayout">
          {visibleStyles.map(([key, style]) => (
            <motion.button
              type="button"
              key={key}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              aria-pressed={value === key}
              aria-label={`选择${style.label}名片背景`}
              onClick={() => onChange(key)}
              className={cn(
                "rounded-xl border-2 p-1 transition-colors",
                value === key
                  ? "border-black dark:border-white"
                  : "border-transparent hover:border-black/10 dark:hover:border-white/10"
              )}
            >
              <span
                className={cn("block h-10 w-full rounded-lg mb-2", style.preview)}
              />
              <span className="block text-xs text-center truncate">
                {style.label}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      {styles.length > 6 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="w-full text-neutral-500"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 mr-1" />
          ) : (
            <ChevronDown className="w-4 h-4 mr-1" />
          )}
          {expanded ? "收起样式" : `查看更多样式 (${styles.length - 6})`}
        </Button>
      )}
    </div>
  )
}
