// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
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

  it("restores original Bing image URLs before rendering the page background", () => {
    const thumbnail =
      "https://tse1-mm.cn.bing.net/th/id/OIP-C.example?w=320&h=114&c=7"
    const { container } = render(
      <PostPageBackground coverImage={thumbnail} />
    )

    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "https://tse1-mm.cn.bing.net/th/id/OIP-C.example"
    )
  })

  it("renders a fallback page background when the article has no cover", () => {
    const { container } = render(<PostPageBackground coverImage={null} />)

    expect(screen.queryByRole("img")).toBeNull()
    expect(
      container.firstElementChild?.getAttribute("data-has-cover")
    ).toBe("false")
  })
})
