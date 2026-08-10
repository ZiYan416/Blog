// @vitest-environment jsdom

import { act, cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CinematicHero } from "@/features/home/components/cinematic-hero"

vi.mock("next/image", () => ({
  default: ({ src }: { src: string }) => (
    <span data-mocked-image={src} />
  ),
}))

vi.mock("@/features/settings/hooks/use-data-saver", () => ({
  useDataSaver: () => ({
    isDataSaverActive: false,
    isNetworkStatusReady: true,
  }),
}))

describe("CinematicHero theme transition", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark")

    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))

    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined)
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {})
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {})
  })

  afterEach(async () => {
    cleanup()
    await new Promise((resolve) => globalThis.setTimeout(resolve, 0))
    document.documentElement.classList.remove("dark")
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("keeps both video groups mounted and crossfades them when the theme changes", async () => {
    render(<CinematicHero />)

    await waitFor(() => {
      expect(document.querySelector('[data-video-group="day"]')).not.toBeNull()
      expect(document.querySelector('[data-video-group="night"]')).not.toBeNull()
    })

    const dayGroup = document.querySelector<HTMLElement>('[data-video-group="day"]')!
    const nightGroup = document.querySelector<HTMLElement>('[data-video-group="night"]')!

    expect(dayGroup?.className).toContain("duration-1500")
    expect(dayGroup?.className).toContain("opacity-100")
    expect(nightGroup?.className).toContain("opacity-0")
    expect(nightGroup?.querySelectorAll("source")).toHaveLength(0)

    act(() => {
      document.documentElement.classList.add("dark")
    })

    await waitFor(() => {
      expect(dayGroup?.className).toContain("opacity-0")
      expect(nightGroup?.className).toContain("opacity-100")
    })

    expect(document.querySelector('[data-video-group="day"]')).toBe(dayGroup)
    expect(document.querySelector('[data-video-group="night"]')).toBe(nightGroup)
    expect(nightGroup?.querySelectorAll("source").length).toBeGreaterThan(0)
  })
})
