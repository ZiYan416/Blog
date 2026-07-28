// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { PostHeroCover } from "@/components/post/post-hero-cover"

describe("PostHeroCover", () => {
  afterEach(cleanup)

  it("passes arbitrary external cover URLs through without Next optimization", () => {
    const coverImage = "https://images.example.com/article-cover.jpg"

    render(<PostHeroCover coverImage={coverImage} title="External cover" />)

    expect(
      screen.getByRole("img", { name: "External cover" }).getAttribute("src")
    ).toBe(coverImage)
  })

  it("renders no image when the article has no cover", () => {
    render(<PostHeroCover coverImage={null} title="No cover" />)

    expect(screen.queryByRole("img")).toBeNull()
  })
})
