import { BrandedLoaderVisual } from "@/components/layout/branded-loader"

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="网站正在加载"
      className="fixed inset-0 z-[9999] flex min-h-[100dvh] items-center justify-center bg-[#fafafa] dark:bg-[#050505] touch-none"
    >
      <BrandedLoaderVisual />
    </div>
  )
}
