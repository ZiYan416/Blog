"use client"

import { useEffect } from 'react'
import {
  getMarkdownSelectionText,
  removeCopyExcludedElements,
} from '@/features/posts/markdown-copy'

interface MarkdownCopyControllerProps {
  targetId: string
}

export function MarkdownCopyController({ targetId }: MarkdownCopyControllerProps) {
  useEffect(() => {
    document.getElementById('highlight-theme')?.remove()

    document
      .querySelectorAll('link[rel="stylesheet"]')
      .forEach((link) => {
        if (link instanceof HTMLLinkElement && link.href.includes('highlight.js')) {
          link.remove()
        }
      })

    const article = document.getElementById(targetId)
    if (!article) return

    const handleCopy = (event: ClipboardEvent) => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return
      if (
        !article.contains(selection.anchorNode) ||
        !article.contains(selection.focusNode)
      ) {
        return
      }

      const fragment = selection.getRangeAt(0).cloneContents()
      removeCopyExcludedElements(fragment)
      const plainText = getMarkdownSelectionText(fragment)
      if (!plainText || !event.clipboardData) return

      const htmlContainer = document.createElement('div')
      htmlContainer.append(fragment.cloneNode(true))

      event.preventDefault()
      event.clipboardData.setData('text/plain', plainText)
      event.clipboardData.setData('text/html', htmlContainer.innerHTML)
    }

    article.addEventListener('copy', handleCopy)
    return () => article.removeEventListener('copy', handleCopy)
  }, [targetId])

  return null
}
