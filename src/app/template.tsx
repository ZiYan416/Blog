"use client"

import { motion, useReducedMotion } from "framer-motion"

export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.4,
        ease: [0.2, 0.01, 0, 1], // Custom cubic-bezier for a "premium" feel
      }}
    >
      {children}
    </motion.div>
  )
}
