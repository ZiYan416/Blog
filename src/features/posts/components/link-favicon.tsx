"use client"

import { useState } from "react"
import { Link2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkFaviconProps {
  href: string
  className?: string
}

export function getLinkFaviconUrl(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) return "/icon.svg"

  try {
    const url = new URL(href.startsWith("//") ? `https:${href}` : href)
    if (!["http:", "https:"].includes(url.protocol)) return null

    return new URL("/favicon.ico", url.origin).toString()
  } catch {
    return null
  }
}

export function LinkFavicon({ href, className }: LinkFaviconProps) {
  const faviconUrl = getLinkFaviconUrl(href)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const failed = !faviconUrl || failedUrl === faviconUrl

  return (
    <span
      className={cn("link-favicon", className)}
      contentEditable={false}
      data-copy-exclude="true"
      aria-hidden="true"
    >
      <Link2 className="link-favicon__fallback" />
      {!failed ? (
        // Favicons are small remote assets with unknown intrinsic dimensions.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={faviconUrl}
          alt=""
          className="link-favicon__image"
          data-loaded={loadedUrl === faviconUrl}
          loading="lazy"
          decoding="async"
          draggable={false}
          referrerPolicy="no-referrer"
          onLoad={() => setLoadedUrl(faviconUrl)}
          onError={() => setFailedUrl(faviconUrl)}
        />
      ) : null}
    </span>
  )
}
