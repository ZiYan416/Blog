"use client"

import Link from "@tiptap/extension-link"
import { MarkViewContent, ReactMarkViewRenderer } from "@tiptap/react"
import type { MarkViewProps } from "@tiptap/core"
import { LinkFavicon } from "@/features/posts/components/link-favicon"

function EditorLinkMark({ mark }: MarkViewProps) {
  const href = typeof mark.attrs.href === "string" ? mark.attrs.href : ""
  const target =
    typeof mark.attrs.target === "string" ? mark.attrs.target : undefined
  const rel = typeof mark.attrs.rel === "string" ? mark.attrs.rel : undefined

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className="editor-link"
      onClick={(event) => event.preventDefault()}
    >
      <LinkFavicon href={href} className="editor-link__favicon" />
      <MarkViewContent />
    </a>
  )
}

export const ArticleLink = Link.extend({
  addMarkView() {
    return ReactMarkViewRenderer(EditorLinkMark, {
      as: "span",
      className: "editor-link-mark",
    })
  },
})
