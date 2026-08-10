/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  ImageIcon,
  Loader2,
  RefreshCw,
  Share2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { renderShareCardPng } from '../share-card-image'
import { PostShareCard, type ShareCardPost } from './post-share-card'

interface PostShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: ShareCardPost
}

type GenerationStatus = 'idle' | 'generating' | 'ready' | 'error'

export function PostShareModal({ open, onOpenChange, post }: PostShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const generationRef = useRef<Promise<string | null> | null>(null)
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [canCopyImage] = useState(() =>
    typeof navigator !== 'undefined' &&
    Boolean(navigator.clipboard?.write) &&
    typeof ClipboardItem !== 'undefined'
  )
  const [canWebShare] = useState(() =>
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  )
  const { toast } = useToast()

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const updateViewport = () => setIsMobile(media.matches)

    updateViewport()
    media.addEventListener('change', updateViewport)
    return () => media.removeEventListener('change', updateViewport)
  }, [])

  const generateCardImage = useCallback(async () => {
    if (!cardRef.current) return null
    if (generationRef.current) return generationRef.current

    setStatus('generating')
    setCopied(false)

    const generation = renderShareCardPng(cardRef.current)
      .then((dataUrl) => {
        setImgUrl(dataUrl)
        setStatus('ready')
        return dataUrl
      })
      .catch((error) => {
        console.error('Failed to generate share card image:', error)
        setStatus('error')
        toast({
          title: '生成分享卡片失败',
          description: '图片资源暂时不可用，请重试；仍失败时可直接分享文章链接。',
          variant: 'destructive',
        })
        return null
      })
      .finally(() => {
        generationRef.current = null
      })

    generationRef.current = generation
    return generation
  }, [toast])

  useEffect(() => {
    if (!open) return
    void generateCardImage()
  }, [generateCardImage, open])

  const handleDownload = async () => {
    const currentUrl = imgUrl || (await generateCardImage())
    if (!currentUrl) return

    const link = document.createElement('a')
    link.download = `share-${post.slug || post.public_id}.png`
    link.href = currentUrl
    document.body.appendChild(link)
    link.click()
    link.remove()

    toast({
      title: '已保存分享卡片',
      description: '图片已下载到本地。',
    })
  }

  const handleCopy = async () => {
    const currentUrl = imgUrl || (await generateCardImage())
    if (!currentUrl) return

    if (!canCopyImage) {
      toast({
        title: '当前浏览器不支持复制图片',
        description: '请使用“保存图片”后再分享。',
        variant: 'warning',
      })
      return
    }

    try {
      const blob = await fetch(currentUrl).then((response) => response.blob())
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setCopied(true)
      toast({
        title: '已复制到剪贴板',
        description: '现在可以直接粘贴到聊天窗口。',
      })
      window.setTimeout(() => setCopied(false), 3_000)
    } catch (error) {
      console.error('Failed to copy share card:', error)
      toast({
        title: '复制失败',
        description: '浏览器未授予剪贴板权限，请改用“保存图片”。',
        variant: 'destructive',
      })
    }
  }

  const handleWebShare = async () => {
    const currentUrl = imgUrl || (await generateCardImage())
    if (!currentUrl) return

    if (!canWebShare) {
      await handleDownload()
      return
    }

    try {
      const blob = await fetch(currentUrl).then((response) => response.blob())
      const file = new File([blob], `share-${post.slug || post.public_id}.png`, {
        type: 'image/png',
      })
      const shareData = navigator.canShare?.({ files: [file] })
        ? {
            title: post.title,
            text: post.excerpt || post.title,
            url: post.url,
            files: [file],
          }
        : {
            title: post.title,
            text: post.excerpt || post.title,
            url: post.url,
          }

      await navigator.share(shareData)
    } catch (error: unknown) {
      if ((error as Error)?.name === 'AbortError') return

      console.error('Failed to share card:', error)
      toast({
        title: '无法调起系统分享',
        description: '已保留卡片预览，你仍可保存图片后分享。',
        variant: 'warning',
      })
    }
  }

  const generating = status === 'generating' || status === 'idle'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div
        className="pointer-events-none fixed left-0 top-0 -translate-x-[200vw]"
        aria-hidden="true"
      >
        <PostShareCard ref={cardRef} post={post} />
      </div>

      <DialogContent className="grid max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[880px] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[24px] border-neutral-200 bg-white p-0 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 sm:max-h-[90dvh]">
        <DialogHeader className="border-b border-neutral-200/80 px-5 py-4 pr-16 text-left dark:border-neutral-800 sm:px-6 sm:py-5 sm:pr-16">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-600 dark:text-amber-400">
              <Share2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-bold tracking-tight sm:text-xl">
                分享这篇文章
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs leading-relaxed text-neutral-500 sm:text-sm">
                生成带二维码的文章卡片，保存、复制或直接分享。
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid min-h-0 overflow-y-auto md:grid-cols-[minmax(0,1.35fr)_minmax(250px,0.65fr)]">
          <section className="flex min-h-[300px] items-center justify-center bg-neutral-100/80 p-4 dark:bg-neutral-900/70 sm:p-6 md:min-h-[520px]">
            {imgUrl ? (
              <div className="relative flex w-full items-center justify-center">
                <img
                  src={imgUrl}
                  alt={`“${post.title}”的分享卡片预览`}
                  className="max-h-[58dvh] w-auto max-w-full rounded-2xl border border-neutral-300 object-contain shadow-[0_22px_60px_-30px_rgba(15,23,42,0.55)] dark:border-neutral-700 md:max-h-[66dvh]"
                />
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur">
                  <Check className="h-3 w-3" />
                  图片已就绪
                </span>
              </div>
            ) : status === 'error' ? (
              <div className="mx-auto flex max-w-xs flex-col items-center text-center">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                  <AlertCircle className="h-6 w-6" />
                </span>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  卡片没有生成成功
                </h3>
                <p className="mt-2 text-xs leading-5 text-neutral-500">
                  可能是封面或头像暂时无法读取。重试时会自动使用安全占位图，不影响二维码和文章信息。
                </p>
                <Button
                  variant="outline"
                  onClick={() => void generateCardImage()}
                  className="mt-5 h-10 rounded-xl px-4 text-xs font-semibold"
                >
                  <RefreshCw className="h-4 w-4" />
                  重新生成
                </Button>
              </div>
            ) : (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center text-center"
              >
                <span className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                  <ImageIcon className="h-6 w-6 text-neutral-400" />
                  <Loader2 className="absolute -right-1 -top-1 h-5 w-5 animate-spin rounded-full bg-amber-500 p-1 text-white" />
                </span>
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  正在生成高清卡片
                </p>
                <p className="mt-1 text-xs text-neutral-500">正在准备图片、字体和二维码…</p>
              </div>
            )}
          </section>

          <aside className="flex min-w-0 flex-col border-t border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950 md:border-l md:border-t-0 sm:p-6">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  导出状态
                </span>
                <span
                  className={
                    status === 'ready'
                      ? 'text-xs font-semibold text-emerald-600 dark:text-emerald-400'
                      : status === 'error'
                        ? 'text-xs font-semibold text-red-500'
                        : 'text-xs font-semibold text-amber-600 dark:text-amber-400'
                  }
                >
                  {status === 'ready' ? '可以分享' : status === 'error' ? '需要重试' : '生成中'}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-neutral-500">
                {status === 'ready'
                  ? isMobile
                    ? '可直接调起系统分享，也可以保存到相册。'
                    : '可复制图片粘贴到聊天窗口，或下载原图。'
                  : status === 'error'
                    ? '文章链接仍可正常访问；请重新生成卡片。'
                    : '通常只需几秒，资源不可用时会自动降级。'}
              </p>
            </div>

            <div className="mt-auto pt-5">
              <div className="flex flex-col gap-2.5">
                {isMobile && canWebShare && (
                  <Button
                    onClick={() => void handleWebShare()}
                    disabled={generating || !imgUrl}
                    className="h-11 w-full rounded-xl bg-amber-500 text-sm font-semibold text-white hover:bg-amber-600"
                  >
                    <Share2 className="h-4 w-4" />
                    分享到其他应用
                  </Button>
                )}

                {!isMobile && canCopyImage && (
                  <Button
                    onClick={() => void handleCopy()}
                    disabled={generating || !imgUrl}
                    className="h-11 w-full rounded-xl bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    {copied ? '已复制图片' : '复制图片'}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => void handleDownload()}
                  disabled={generating || !imgUrl}
                  className={
                    isMobile && !canWebShare
                      ? 'h-11 w-full rounded-xl bg-amber-500 text-sm font-semibold text-white hover:bg-amber-600'
                      : 'h-11 w-full rounded-xl text-sm font-semibold'
                  }
                >
                  <Download className="h-4 w-4" />
                  保存高清图片
                </Button>
              </div>

              <p className="mt-4 text-center text-[11px] leading-4 text-neutral-400">
                卡片包含文章公开信息与阅读二维码
              </p>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}
