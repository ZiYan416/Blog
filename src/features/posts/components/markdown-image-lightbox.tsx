"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Minus, Plus, RotateCcw, X } from "lucide-react"

interface PreviewImage {
  src: string
  alt: string
}

const MIN_SCALE = 0.5
const MAX_SCALE = 5
const SCALE_STEP = 0.25

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
}

export function MarkdownImageLightbox({ targetId }: { targetId: string }) {
  const [preview, setPreview] = useState<PreviewImage | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  const resetView = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const close = useCallback(() => {
    setPreview(null)
    resetView()
  }, [resetView])

  const updateScale = useCallback((nextScale: number) => {
    const clamped = clampScale(nextScale)
    setScale(clamped)
    if (clamped <= 1) setOffset({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target) return

    const findImage = (eventTarget: EventTarget | null) =>
      eventTarget instanceof Element
        ? eventTarget.closest<HTMLImageElement>(
            'img[data-markdown-lightbox="true"]'
          )
        : null
    const openImage = (image: HTMLImageElement) => {
      setPreview({
        src: image.currentSrc || image.src,
        alt: image.alt || "正文图片",
      })
      resetView()
    }
    const handleClick = (event: MouseEvent) => {
      const image = findImage(event.target)
      if (!image) return
      event.preventDefault()
      event.stopPropagation()
      openImage(image)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      const image = findImage(event.target)
      if (!image || !["Enter", " "].includes(event.key)) return
      event.preventDefault()
      openImage(image)
    }

    target.addEventListener("click", handleClick)
    target.addEventListener("keydown", handleKeyDown)
    return () => {
      target.removeEventListener("click", handleClick)
      target.removeEventListener("keydown", handleKeyDown)
    }
  }, [resetView, targetId])

  useEffect(() => {
    if (!preview) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
      if (["+", "="].includes(event.key)) updateScale(scale + SCALE_STEP)
      if (event.key === "-") updateScale(scale - SCALE_STEP)
      if (event.key === "0") resetView()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [close, preview, resetView, scale, updateScale])

  if (!preview) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-black/55 p-1.5 text-white shadow-lg backdrop-blur-md">
        <button
          type="button"
          aria-label="缩小图片"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-40"
          onClick={() => updateScale(scale - SCALE_STEP)}
          disabled={scale <= MIN_SCALE}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-14 text-center text-xs font-medium tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          aria-label="放大图片"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-40"
          onClick={() => updateScale(scale + SCALE_STEP)}
          disabled={scale >= MAX_SCALE}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="重置图片"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15"
          onClick={resetView}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="关闭图片预览"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15"
          onClick={close}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="flex h-full w-full touch-none select-none items-center justify-center overflow-hidden"
        onWheel={(event) => {
          event.preventDefault()
          updateScale(scale + (event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP))
        }}
        onDoubleClick={() => updateScale(scale === 1 ? 2 : 1)}
        onPointerDown={(event) => {
          if (scale <= 1) return
          event.currentTarget.setPointerCapture(event.pointerId)
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            originX: offset.x,
            originY: offset.y,
          }
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current
          if (!drag || drag.pointerId !== event.pointerId) return
          setOffset({
            x: drag.originX + event.clientX - drag.startX,
            y: drag.originY + event.clientY - drag.startY,
          })
        }}
        onPointerUp={(event) => {
          if (dragRef.current?.pointerId === event.pointerId) {
            dragRef.current = null
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview.src}
          alt={preview.alt}
          draggable={false}
          className="max-h-[calc(100vh-7rem)] max-w-[calc(100vw-2rem)] object-contain shadow-2xl transition-transform duration-100 ease-out"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
            cursor: scale > 1 ? "grab" : "zoom-in",
          }}
        />
      </div>
    </div>,
    document.body
  )
}
