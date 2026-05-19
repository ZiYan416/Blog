"use client"

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
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
  const [copied, setCopied] = useState(false)

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

      <div className={cn('article-code-block__body', bodyClassName)}>{children}</div>
    </div>
  )
}
