"use client"

import { useState, type SyntheticEvent } from 'react'
import Image, { type ImageLoaderProps, type ImageProps } from 'next/image'
import { canUseNextImageOptimizer } from '@/lib/image-hosts'

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src: string
}

function passthroughLoader({ src }: ImageLoaderProps) {
  return src
}

/**
 * Uses the Next.js image optimizer for trusted origins and a layout-safe,
 * unoptimized fallback for user-provided URLs from arbitrary hosts.
 */
export function SafeImage({ src, alt, onError, ...props }: SafeImageProps) {
  const [failedOptimizerSrc, setFailedOptimizerSrc] = useState<string | null>(null)
  const shouldOptimize =
    canUseNextImageOptimizer(src) && failedOptimizerSrc !== src

  const handleOptimizerError = (event: SyntheticEvent<HTMLImageElement>) => {
    setFailedOptimizerSrc(src)
    onError?.(event)
  }

  if (shouldOptimize) {
    return (
      <Image
        src={src}
        alt={alt}
        onError={handleOptimizerError}
        {...props}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      loader={passthroughLoader}
      unoptimized
      onError={onError}
      {...props}
    />
  )
}
