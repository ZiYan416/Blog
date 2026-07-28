"use client"

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Copy, Sparkles } from 'lucide-react'
import hljs from 'highlight.js'
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

export function detectCodeLanguage(codeText: string): string | null {
  if (!codeText || codeText.trim().length < 3) return null
  try {
    const result = hljs.highlightAuto(codeText)
    if (result && result.language && (result.relevance === undefined || result.relevance > 0)) {
      return result.language
    }
  } catch {
    // Ignore detection errors
  }
  return null
}

export function CodeBlockShell({
  children,
  language = 'text',
  onCopy,
  className,
  bodyClassName,
}: CodeBlockShellProps) {
  const COLLAPSED_HEIGHT = 360
  const DEFAULT_EXPANDED_MAX_HEIGHT = 720
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [canCollapse, setCanCollapse] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)
  const [expandedMaxHeight, setExpandedMaxHeight] = useState(DEFAULT_EXPANDED_MAX_HEIGHT)
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null)

  const headerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const isUnspecified =
        !language || ['text', 'plaintext', 'raw', 'unknown', 'code'].includes(language.toLowerCase())

      if (isUnspecified && bodyRef.current) {
        const codeText = bodyRef.current.textContent || ''
        setDetectedLanguage(detectCodeLanguage(codeText))
      } else {
        setDetectedLanguage(null)
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [children, language])

  useEffect(() => {
    const syncExpandedLimit = () => {
      const nextMaxHeight = Math.round(window.innerHeight * 0.72)
      setExpandedMaxHeight(Math.max(COLLAPSED_HEIGHT + 80, Math.min(nextMaxHeight, 920)))
    }

    syncExpandedLimit()
    window.addEventListener('resize', syncExpandedLimit)

    return () => window.removeEventListener('resize', syncExpandedLimit)
  }, [])

  useEffect(() => {
    const bodyElement = bodyRef.current
    const headerElement = headerRef.current
    if (!bodyElement || !headerElement) return

    const measure = () => {
      const nextHeight = headerElement.offsetHeight + bodyElement.scrollHeight
      setContentHeight(nextHeight)
      const nextCanCollapse = nextHeight > COLLAPSED_HEIGHT + 8
      setCanCollapse(nextCanCollapse)
      if (!nextCanCollapse) {
        setExpanded(false)
      }
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(bodyElement)
    observer.observe(headerElement)

    return () => observer.disconnect()
  }, [children])

  useEffect(() => {
    if (!expanded) {
      viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [expanded])

  const handleCopy = async () => {
    if (!onCopy) return
    await onCopy()
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const viewportHeight = canCollapse
    ? Math.min(contentHeight, expanded ? expandedMaxHeight : COLLAPSED_HEIGHT)
    : contentHeight
  const displayLanguage = detectedLanguage || language || 'text'
  const isAuto = Boolean(detectedLanguage)

  return (
    <div className={cn('article-code-block group', className)}>
      <div
        ref={viewportRef}
        className={cn(
          'article-code-block__viewport',
          canCollapse && expanded && 'article-code-block__viewport--scrollable',
          canCollapse && !expanded && 'article-code-block__viewport--collapsed'
        )}
        style={viewportHeight ? { maxHeight: `${viewportHeight}px` } : undefined}
      >
        <div ref={headerRef} className="article-code-block__header">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="article-code-block__dot article-code-block__dot--red" />
              <div className="article-code-block__dot article-code-block__dot--yellow" />
              <div className="article-code-block__dot article-code-block__dot--green" />
            </div>
            <div className="flex items-center gap-1.5 ml-1">
              <span className="article-code-block__language">{displayLanguage}</span>
              {isAuto && (
                <span
                  className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-300 font-sans tracking-normal select-none"
                  title="自动识别的代码语言"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>auto</span>
                </span>
              )}
            </div>
          </div>
          <div className="article-code-block__controls">
            {canCollapse ? (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="article-code-block__toggle"
                aria-expanded={expanded}
              >
                <ChevronDown
                  className={cn('h-3.5 w-3.5 transition-transform duration-300', expanded && 'rotate-180')}
                />
                <span>{expanded ? '收起' : '展开'}</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleCopy}
              className="article-code-block__copy"
              title="Copy code"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
        <div ref={bodyRef} className={cn('article-code-block__body', bodyClassName)}>
          {children}
        </div>
        {canCollapse && !expanded ? <div className="article-code-block__fade" /> : null}
      </div>
    </div>
  )
}

