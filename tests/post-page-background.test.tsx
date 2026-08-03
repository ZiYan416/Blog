// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { PostPageBackground } from "@/features/posts/components/post-page-background"

describe("PostPageBackground", () => {
  afterEach(cleanup)

  it("passes arbitrary external cover URLs through without Next optimization", () => {
    const coverImage = "https://images.example.com/article-cover.jpg"

    const { container } = render(
      <PostPageBackground coverImage={coverImage} />
    )

    expect(container.querySelector("img")?.getAttribute("src")).toBe(coverImage)
    expect(
      container.firstElementChild?.hasAttribute("data-post-background")
    ).toBe(true)
    expect(container.firstElementChild?.classList.contains("absolute")).toBe(true)
    expect(container.firstElementChild?.classList.contains("-top-16")).toBe(true)
  })

  it("restores and optimizes original Bing image URLs before rendering", () => {
    const thumbnail =
      "https://tse1-mm.cn.bing.net/th/id/OIP-C.example?w=320&h=114&c=7"
    const { container } = render(
      <PostPageBackground coverImage={thumbnail} />
    )

    const imageSrc = container.querySelector("img")?.getAttribute("src") || ""
    expect(imageSrc).toContain("/_next/image?")
    expect(decodeURIComponent(imageSrc)).toContain(
      "https://tse1-mm.cn.bing.net/th/id/OIP-C.example"
    )
    expect(imageSrc).not.toContain("%3Fw%3D320")
  })

  it("optimizes managed ImgBed cover URLs", () => {
    const coverImage = "https://img.lunalbl.com/blog/2026/08/cover.webp"
    const { container } = render(
      <PostPageBackground coverImage={coverImage} />
    )

    const imageSrc = container.querySelector("img")?.getAttribute("src") || ""
    expect(imageSrc).toContain("/_next/image?")
    expect(decodeURIComponent(imageSrc)).toContain(coverImage)
  })

  it("falls back to the original URL when optimization fails", () => {
    const coverImage = "https://img.lunalbl.com/blog/2026/08/cover.webp"
    const { container } = render(
      <PostPageBackground coverImage={coverImage} />
    )
    const image = container.querySelector("img")

    expect(image?.getAttribute("src")).toContain("/_next/image?")
    fireEvent.error(image as HTMLImageElement)
    expect(container.querySelector("img")?.getAttribute("src")).toBe(coverImage)
  })

  it("renders a fallback page background when the article has no cover", () => {
    const { container } = render(<PostPageBackground coverImage={null} />)

    expect(screen.queryByRole("img")).toBeNull()
    expect(
      container.firstElementChild?.getAttribute("data-has-cover")
    ).toBe("false")
  })
})
