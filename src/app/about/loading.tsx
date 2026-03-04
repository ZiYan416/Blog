import { Skeleton } from "@/components/ui/skeleton"

export default function AboutLoading() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      
      {/* ─────────────────────────────────────────────
         Technical Background (Matching About Page)
         ───────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, #808080 1px, transparent 1px),
                              linear-gradient(to bottom, #808080 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
          }}
        />
        
        {/* Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ─────────────────────────────────────────────
         Cinematic Centerpiece
         ───────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        
        {/* Amber-themed Preloader / Orb */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
          {/* Pulsing core */}
          <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping" />
          <div className="relative w-8 h-8 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.4)] animate-pulse" />
          
          {/* Rotating ring */}
          <div className="absolute inset-0 border border-amber-500/30 rounded-full animate-[spin_3s_linear_infinite] border-t-transparent" />
        </div>

        {/* High-end Text Skeletons */}
        <div className="flex flex-col items-center space-y-4">
          {/* Title Skeleton */}
          <div className="h-12 w-48 sm:h-16 sm:w-64 md:h-24 md:w-96 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/50 animate-pulse" />
          
          {/* Subtitle Skeleton */}
          <div className="h-4 w-32 sm:h-5 sm:w-40 bg-neutral-200/50 dark:bg-neutral-800/50 rounded animate-pulse delay-75" />
          
          {/* Divider Skeleton */}
          <div className="h-px w-16 bg-neutral-300 dark:bg-neutral-700 mt-6" />
        </div>

      </div>

      {/* Decorative Rings (Faint Outline) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full border border-neutral-200/10 dark:border-white/[0.02] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full border border-neutral-200/10 dark:border-white/[0.03] pointer-events-none" />

    </div>
  )
}
