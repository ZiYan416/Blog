import { afterEach, describe, expect, it, vi } from "vitest"
import { canUseNextImageOptimizer } from "@/lib/image-hosts"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("trusted image origins", () => {
  it("optimizes local, managed, avatar, and constrained Bing images", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co")

    expect(canUseNextImageOptimizer("/images/cover.webp")).toBe(true)
    expect(
      canUseNextImageOptimizer("https://img.lunalbl.com/blog/2026/08/cover.webp")
    ).toBe(true)
    expect(
      canUseNextImageOptimizer(
        "https://project.supabase.co/storage/v1/object/public/blog-images/cover.webp"
      )
    ).toBe(true)
    expect(
      canUseNextImageOptimizer("https://avatars.githubusercontent.com/u/1?v=4")
    ).toBe(true)
    expect(
      canUseNextImageOptimizer("https://tse1-mm.cn.bing.net/th/id/OIP.example")
    ).toBe(true)
  })

  it("keeps arbitrary and lookalike remote sources outside the optimizer", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co")

    expect(
      canUseNextImageOptimizer("https://images.example.com/cover.jpg")
    ).toBe(false)
    expect(
      canUseNextImageOptimizer("https://img.lunalbl.com.evil.example/cover.jpg")
    ).toBe(false)
    expect(
      canUseNextImageOptimizer("https://project.supabase.co/private/cover.jpg")
    ).toBe(false)
    expect(
      canUseNextImageOptimizer("https://tse1-mm.cn.bing.net/not-an-image/cover")
    ).toBe(false)
  })
})
