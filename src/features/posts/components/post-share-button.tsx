"use client"

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShareCardPost } from './post-share-card'
import { cn } from '@/lib/utils'

// Lazy load modal to keep initial page bundle size small & performance fast
const PostShareModal = dynamic(
  () => import('./post-share-modal').then((mod) => mod.PostShareModal),
  { ssr: false }
)

interface PostShareButtonProps {
  post: ShareCardPost
  variant?: 'hero' | 'floating' | 'outline'
  className?: string
}

export function PostShareButton({ post, variant = 'hero', className }: PostShareButtonProps) {
  const [open, setOpen] = useState(false)

  if (variant === 'floating') {
    return (
      <>
        <Button
          onClick={() => setOpen(true)}
          size="icon"
          aria-label="生成文章分享卡片"
          title="生成文章分享卡片"
          className={cn(
            "rounded-full h-12 w-12 bg-neutral-100/90 dark:bg-neutral-800/90 backdrop-blur-md shadow-xl border border-black/[0.08] dark:border-white/[0.08] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:scale-110 active:scale-95 transition-all duration-300",
            className
          )}
        >
          <Share2 className="h-5 w-5 text-amber-500" />
        </Button>

        {open && (
          <PostShareModal open={open} onOpenChange={setOpen} post={post} />
        )}
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        type="button"
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white/90 bg-black/20 dark:bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 hover:text-white transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95",
          className
        )}
      >
        <Share2 className="w-3.5 h-3.5 text-amber-400" />
        <span>分享卡片</span>
      </button>

      {open && (
        <PostShareModal open={open} onOpenChange={setOpen} post={post} />
      )}
    </>
  )
}
