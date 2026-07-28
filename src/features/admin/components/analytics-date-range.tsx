"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type DateRange = '7d' | '30d' | 'all'

interface AnalyticsDateRangeProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function AnalyticsDateRange({ value, onChange }: AnalyticsDateRangeProps) {
  const ranges: { label: string; value: DateRange }[] = [
    { label: '7 天', value: '7d' },
    { label: '30 天', value: '30d' },
    { label: '全部', value: 'all' },
  ]

  return (
    <>
      {/* 移动端：下拉选择器 */}
      <div className="md:hidden">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-[100px] h-9 bg-neutral-100 dark:bg-neutral-800 border-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ranges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 桌面端：按钮组 */}
      <div className="hidden md:inline-flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
        {ranges.map((range) => (
          <Button
            key={range.value}
            variant={value === range.value ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(range.value)}
            className={`
              px-4 py-2 text-xs font-medium rounded-lg transition-all
              ${value === range.value
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }
            `}
          >
            {range.label}
          </Button>
        ))}
      </div>
    </>
  )
}
