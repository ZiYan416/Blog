"use client"

import { useEffect, useState } from "react"
import { BrandedLoaderVisual } from "@/components/layout/branded-loader"
import { cn } from "@/lib/utils"

const MIN_VISIBLE_MS = 650
const MAX_VISIBLE_MS = 5000
const EXIT_DURATION_MS = 450

export function SiteLoader() {
  const [phase, setPhase] = useState<"visible" | "exiting" | "hidden">("visible")

  useEffect(() => {
    const startedAt = performance.now()
    let heroReady =
      window.location.pathname !== "/" ||
      document.documentElement.dataset.heroReady === "true"
    let hidden = false
    const timers = new Set<number>()

    const beginExit = () => {
      setPhase("exiting")
      const exitTimer = window.setTimeout(
        () => setPhase("hidden"),
        EXIT_DURATION_MS
      )
      timers.add(exitTimer)
    }

    const reveal = () => {
      if (hidden || !heroReady) return
      hidden = true
      const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - startedAt))
      const revealTimer = window.setTimeout(beginExit, remaining)
      timers.add(revealTimer)
    }
    const handleHeroReady = () => {
      heroReady = true
      reveal()
    }

    window.addEventListener("site-critical-ready", handleHeroReady)
    reveal()

    const fallback = window.setTimeout(() => {
      hidden = true
      beginExit()
    }, MAX_VISIBLE_MS)
    timers.add(fallback)

    return () => {
      window.removeEventListener("site-critical-ready", handleHeroReady)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  if (phase === "hidden") return null

  return (
    <div
      role="status"
      aria-label="网站正在加载"
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-[#fafafa] opacity-100 transition-opacity ease-in-out dark:bg-[#050505]",
        phase === "exiting" && "opacity-0",
      )}
      style={{ transitionDuration: `${EXIT_DURATION_MS}ms` }}
    >
      <BrandedLoaderVisual />
    </div>
  )
}
