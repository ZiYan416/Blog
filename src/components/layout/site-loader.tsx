"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Logo } from "@/components/ui/logo"

const MIN_VISIBLE_MS = 650
const MAX_VISIBLE_MS = 8000
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
    <motion.div
      role="status"
      aria-label="网站正在加载"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "exiting" ? 0 : 1 }}
      transition={{ duration: EXIT_DURATION_MS / 1000, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#fafafa] dark:bg-[#050505]"
    >
          <div className="flex flex-col items-center gap-7">
            <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 bg-black/5 dark:bg-white/10 rounded-3xl md:rounded-[2rem]"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="scale-[1.8] md:scale-[2.5]"
              >
                <Logo size="lg" className="shadow-lg" />
              </motion.div>
            </div>
            <span className="sr-only">正在准备首屏内容</span>
            <div className="flex gap-2" aria-hidden="true">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  className="w-2 h-2 md:w-2.5 md:h-2.5 bg-neutral-400 rounded-full"
                  animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
    </motion.div>
  )
}
