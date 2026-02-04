"use client"

import { motion } from "framer-motion"
import { Logo } from "@/components/ui/logo"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fafafa] dark:bg-[#050505]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.5,
            ease: "easeOut"
          }
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex flex-col items-center gap-6 md:gap-8"
      >
        <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
          {/* Pulsing Background */}
          <motion.div
            className="absolute inset-0 bg-black/5 dark:bg-white/10 rounded-3xl md:rounded-[2rem]"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.2, 0.5]
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }}
          />

          {/* Logo Component */}
          <motion.div
            animate={{
              rotate: [0, 0, 0, 0, 0, 0],
            }}
            className="scale-[1.8] md:scale-[2.5]"
          >
            <Logo size="lg" className="shadow-lg" />
          </motion.div>
        </div>

        {/* Loading Text */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 md:w-2.5 md:h-2.5 bg-neutral-400 rounded-full"
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
