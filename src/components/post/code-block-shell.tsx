"use client"

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockShellProps {
  children: React.ReactNode
  language?: string
  onCopy?: () => Promise<void> | void
  className?: string
  bodyClassName?: string
}

export function extractCodeBlockLanguage(className?: string | null) {
  if (!className) return 'text'
  const match = /language-([\w-]+)/.exec(className)
  return match?.[1]?.toLowerCase() || 'text'
}

export function CodeBlockShell({
  children,
  language = 'text',
  onCopy,
  className,
  bodyClassName,
}: CodeBlockShellProps) {
  const COLLAPSED_HEIGHT = 360
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [canCollapse, setCanCollapse] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = bodyRef.current
    if (!element) return

    const measure = () => {
      const nextHeight = element.scrollHeight
      setContentHeight(nextHeight)
      const nextCanCollapse = nextHeight > COLLAPSED_HEIGHT + 8
      setCanCollapse(nextCanCollapse)
      if (!nextCanCollapse) {
        setExpanded(false)
      }
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element)

    return () => observer.disconnect()
  }, [children])

  const handleCopy = async () => {
    if (!onCopy) return
    await onCopy()
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('article-code-block group', className)}>
      <div className="article-code-block__header">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="article-code-block__dot article-code-block__dot--red" />
            <div className="article-code-block__dot article-code-block__dot--yellow" />
            <div className="article-code-block__dot article-code-block__dot--green" />
          </div>
          <span className="article-code-block__language">{language}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="article-code-block__copy"
          title="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div
        className={cn('article-code-block__viewport', canCollapse && !expanded && 'article-code-block__viewport--collapsed')}
        style={canCollapse ? { maxHeight: `${expanded ? contentHeight : COLLAPSED_HEIGHT}px` } : undefined}
      >
        <div ref={bodyRef} className={cn('article-code-block__body', bodyClassName)}>
          {children}
        </div>
        {canCollapse && !expanded ? <div className="article-code-block__fade" /> : null}
      </div>

      {canCollapse ? (
        <div className="article-code-block__footer">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="article-code-block__toggle"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>{expanded ? '收起代码' : '展开代码'}</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
