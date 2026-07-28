// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { SiteLoader } from "../src/components/layout/site-loader"

describe("SiteLoader", () => {
  afterEach(() => {
    cleanup()
    delete document.documentElement.dataset.heroReady
  })

  it("renders the branded loader as an accessible live status", () => {
    render(<SiteLoader />)

    expect(
      screen.getByRole("status", { name: "网站正在加载" })
    ).toBeTruthy()
    expect(screen.getByText("正在准备首屏内容")).toBeTruthy()
  })

  it("listens for the first-frame readiness signal on the home page", () => {
    const originalAddEventListener = window.addEventListener
    let subscribed = false
    window.addEventListener = ((type: string, listener: EventListener) => {
      if (type === "site-critical-ready") subscribed = true
      return originalAddEventListener.call(window, type, listener)
    }) as typeof window.addEventListener

    render(<SiteLoader />)
    window.addEventListener = originalAddEventListener

    expect(subscribed).toBe(true)
  })
})
