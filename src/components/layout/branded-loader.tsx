import { Logo } from "@/components/ui/logo"

export function BrandedLoaderVisual() {
  return (
    <div className="flex flex-col items-center gap-7">
      <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
        <div
          aria-hidden="true"
          className="branded-loader__halo absolute inset-0 bg-black/5 dark:bg-white/10 rounded-3xl md:rounded-[2rem]"
        />
        <div className="relative z-10 scale-[1.8] md:scale-[2.5]">
          <Logo size="lg" className="shadow-lg" />
        </div>
      </div>
      <span className="sr-only">正在准备首屏内容</span>
      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="branded-loader__dot w-2 h-2 md:w-2.5 md:h-2.5 bg-neutral-400 rounded-full"
            style={{ animationDelay: `${index * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
