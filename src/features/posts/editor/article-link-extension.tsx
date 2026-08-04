"use client"

import Link from "@tiptap/extension-link"
import { MarkView, type MarkViewProps } from "@tiptap/core"
import { getLinkFaviconUrl } from "@/features/posts/components/link-favicon"

function createFallbackIcon() {
  const svgNamespace = "http://www.w3.org/2000/svg"
  const icon = document.createElementNS(svgNamespace, "svg")
  icon.classList.add("link-favicon__fallback")
  icon.setAttribute("viewBox", "0 0 24 24")
  icon.setAttribute("fill", "none")
  icon.setAttribute("stroke", "currentColor")
  icon.setAttribute("stroke-width", "2")
  icon.setAttribute("stroke-linecap", "round")
  icon.setAttribute("stroke-linejoin", "round")

  const upperLink = document.createElementNS(svgNamespace, "path")
  upperLink.setAttribute(
    "d",
    "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
  )
  const lowerLink = document.createElementNS(svgNamespace, "path")
  lowerLink.setAttribute(
    "d",
    "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
  )
  icon.append(upperLink, lowerLink)

  return icon
}

function createFavicon(href: string) {
  const container = document.createElement("span")
  container.className = "link-favicon editor-link__favicon"
  container.contentEditable = "false"
  container.dataset.copyExclude = "true"
  container.setAttribute("aria-hidden", "true")

  const fallback = createFallbackIcon()
  container.append(fallback)

  const faviconUrl = getLinkFaviconUrl(href)
  if (!faviconUrl) {
    return container
  }

  const image = document.createElement("img")
  image.src = faviconUrl
  image.alt = ""
  image.className = "link-favicon__image"
  image.loading = "lazy"
  image.decoding = "async"
  image.draggable = false
  image.referrerPolicy = "no-referrer"
  image.dataset.loaded = "false"
  image.addEventListener(
    "load",
    () => {
      image.dataset.loaded = "true"
      fallback.remove()
    },
    { once: true }
  )
  image.addEventListener("error", () => image.remove(), { once: true })
  container.append(image)

  return container
}

function createLineBreakJoiner() {
  const joiner = document.createElement("span")
  joiner.textContent = "\u2060"
  joiner.dataset.copyExclude = "true"
  joiner.setAttribute("aria-hidden", "true")
  return joiner
}

class EditorLinkMarkView extends MarkView<null> {
  private readonly wrapper: HTMLSpanElement
  private readonly link: HTMLAnchorElement
  private readonly linkContent: HTMLSpanElement

  constructor(props: MarkViewProps) {
    super(null, props)

    const href =
      typeof props.mark.attrs.href === "string" ? props.mark.attrs.href : ""
    this.wrapper = document.createElement("span")
    this.wrapper.className = "editor-link-mark"

    this.link = document.createElement("a")
    this.link.className = "editor-link"
    this.link.href = href
    if (typeof props.mark.attrs.target === "string") {
      this.link.target = props.mark.attrs.target
    }
    if (typeof props.mark.attrs.rel === "string") {
      this.link.rel = props.mark.attrs.rel
    }
    this.link.addEventListener("click", this.preventNavigation)

    this.linkContent = document.createElement("span")
    this.linkContent.dataset.markViewContent = ""
    this.link.append(
      createFavicon(href),
      createLineBreakJoiner(),
      this.linkContent
    )
    this.wrapper.append(this.link)
  }

  private readonly preventNavigation = (event: MouseEvent) => {
    event.preventDefault()
  }

  get dom() {
    return this.wrapper
  }

  get contentDOM() {
    return this.linkContent
  }

  destroy() {
    this.link.removeEventListener("click", this.preventNavigation)
  }
}

export const ArticleLink = Link.extend({
  addMarkView() {
    return (props) => new EditorLinkMarkView(props)
  },
})
