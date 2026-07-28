"use client"

import Image, { type ImageLoaderProps, type ImageProps } from 'next/image'

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src: string
}

const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname
  } catch {
    return ''
  }
})()

function canUseNextOptimizer(src: string) {
  if (src.startsWith('/')) return true

  try {
    const hostname = new URL(src).hostname
    return hostname === supabaseHost || hostname === 'avatars.githubusercontent.com'
  } catch {
    return false
  }
}

function passthroughLoader({ src }: ImageLoaderProps) {
  return src
}

/**
 * Uses the Next.js image optimizer for trusted origins and a layout-safe,
 * unoptimized fallback for user-provided URLs from arbitrary hosts.
 */
export function SafeImage({ src, alt, ...props }: SafeImageProps) {
  if (canUseNextOptimizer(src)) {
    return <Image src={src} alt={alt} {...props} />
  }

  return <Image src={src} alt={alt} loader={passthroughLoader} unoptimized {...props} />
}
