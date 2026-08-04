/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { toPng, toBlob } from 'html-to-image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Download, Share2, Copy, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { PostShareCard, ShareCardPost } from './post-share-card'

interface PostShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: ShareCardPost
}

export function PostShareModal({ open, onOpenChange, post }: PostShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [canWebShare] = useState(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return 'share' in navigator && 'canShare' in navigator
    }
    return false
  })
  const { toast } = useToast()

  // Detect mobile device on mount and resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Function to capture card HTML element to PNG blob/dataURL
  const generateCardImage = useCallback(async () => {
    if (!cardRef.current) return null
    setGenerating(true)
    try {
      // Small delay to ensure images/fonts are rendered
      await new Promise((resolve) => setTimeout(resolve, 150))

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High DPI capture for crispness
        quality: 0.95,
      })

      setImgUrl(dataUrl)
      return dataUrl
    } catch (err) {
      console.error('Failed to generate card image:', err)
      toast({
        title: '生成分享卡片失败',
        description: '建议重试或检查卡片中的远程图片跨域设置',
        variant: 'destructive',
      })
      return null
    } finally {
      setGenerating(false)
    }
  }, [toast])

  // Automatically generate card image and copy to clipboard on Desktop when opened
  useEffect(() => {
    let isMounted = true

    const handleAutoProcess = async () => {
      const dataUrl = await generateCardImage()
      if (!isMounted || !dataUrl) return

      // Desktop auto-copy behavior
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768

      if (!isMobileDevice && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        try {
          const res = await fetch(dataUrl)
          const blob = await res.blob()
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ])
          if (isMounted) {
            setCopied(true)
            toast({
              title: '已自动复制分享卡片',
              description: '文章分享卡片图片已复制到剪贴板，可直接粘贴分享！',
            })
          }
        } catch (copyErr) {
          console.warn('Auto copy to clipboard failed:', copyErr)
        }
      }
    }

    handleAutoProcess()

    return () => {
      isMounted = false
    }
  }, [generateCardImage, toast])

  // Save image to local device
  const handleDownload = async () => {
    const currentUrl = imgUrl || (await generateCardImage())
    if (!currentUrl) return

    const link = document.createElement('a')
    link.download = `share-${post.slug || post.public_id}.png`
    link.href = currentUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: '已保存分享卡片',
      description: '卡片图片已成功下载到本地！',
    })
  }

  // Copy image to clipboard manually
  const handleCopy = async () => {
    const currentUrl = imgUrl || (await generateCardImage())
    if (!currentUrl) return

    try {
      const res = await fetch(currentUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setCopied(true)
      toast({
        title: '已复制到剪贴板',
        description: '分享卡片图片已复制，快去发给朋友吧！',
      })
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error('Manual copy failed:', err)
      toast({
        title: '复制失败',
        description: '浏览器权限限制，请直接长按图片或点击保存到本地',
        variant: 'destructive',
      })
    }
  }

  // Mobile Web Share API
  const handleWebShare = async () => {
    if (!cardRef.current) return
    try {
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      })

      if (!blob) throw new Error('Blob creation failed')

      const file = new File([blob], `share-${post.slug || post.public_id}.png`, {
        type: 'image/png',
      })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url: post.url,
          files: [file],
        })
        toast({
          title: '调起分享成功',
        })
      } else if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url: post.url,
        })
      } else {
        await handleDownload()
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Web share error:', err)
        handleDownload()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Offscreen Card DOM for accurate html-to-image capture */}
      <div
        className="fixed top-0 left-[-9999px] pointer-events-none opacity-0 z-[-100]"
        aria-hidden="true"
      >
        <PostShareCard ref={cardRef} post={post} />
      </div>

      <DialogContent className="w-[92vw] max-w-[92vw] sm:max-w-lg md:max-w-3xl p-4 md:p-6 max-h-[92vh] overflow-y-auto rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
        {/* Mobile Header (visible only on mobile) */}
        <div className="md:hidden mb-2">
          <DialogHeader className="text-left">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              文章分享卡片
            </DialogTitle>
            <DialogDescription className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
              长按图片可保存，亦可使用下方一键分享。
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start">
          {/* Card Preview Container */}
          <div className="w-full md:w-[380px] shrink-0 flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-900/60 p-2 sm:p-3 md:p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 min-h-[180px] md:min-h-[260px]">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={post.title}
                className="w-auto max-w-full max-h-[35vh] md:max-h-[460px] md:w-full rounded-xl border-2 border-neutral-900 dark:border-neutral-200 shadow-md object-contain transition-all"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-400 gap-2 py-8 md:py-12">
                <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-amber-500" />
                <span className="text-xs">正在渲染生成分享卡片...</span>
              </div>
            )}
          </div>

          {/* Information & Action Buttons Container */}
          <div className="flex-1 w-full flex flex-col justify-center md:my-auto min-w-0">
            {/* Desktop Header (visible only on desktop) */}
            <div className="hidden md:block">
              <DialogHeader className="text-left">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-amber-500" />
                  文章分享卡片
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500 mt-1">
                  卡片已生成，电脑端已自动复制图片至剪贴板，方便即时粘贴分享。
                </DialogDescription>
              </DialogHeader>

              {/* Desktop Copy Success Notification */}
              {copied && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>已自动复制卡片图片到剪贴板！可以直接在聊天框 Ctrl+V / Cmd+V 粘贴。</span>
                </div>
              )}
            </div>

            {/* Action Buttons Stack */}
            <div className="mt-3 md:mt-6 pt-3 md:pt-5 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2.5">
              {!isMobile && (
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  disabled={generating}
                  className="w-full justify-center gap-2 text-xs font-semibold rounded-xl h-10"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      已复制到剪贴板
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制图片
                    </>
                  )}
                </Button>
              )}

              {isMobile && canWebShare && (
                <Button
                  onClick={handleWebShare}
                  disabled={generating}
                  className="w-full justify-center gap-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-10"
                >
                  <Share2 className="w-4 h-4" />
                  直接分享到其他软件
                </Button>
              )}

              <Button
                onClick={handleDownload}
                disabled={generating}
                className={
                  isMobile && !canWebShare
                    ? 'w-full justify-center gap-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-10'
                    : 'w-full justify-center gap-2 text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl h-10'
                }
              >
                <Download className="w-4 h-4" />
                保存图片到本地
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
