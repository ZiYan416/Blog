// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { PostGrid } from "@/features/posts/components/post-grid"
import type { Post } from "@/features/posts/components/post-card"

vi.mock("@/features/posts/components/post-card", () => ({
  default: ({
    post,
    preloadCover,
  }: {
    post: Post
    preloadCover?: boolean
  }) => (
    <div data-testid="post-card" data-preload-cover={String(preloadCover)}>
      {post.title}
    </div>
  ),
}))

afterEach(cleanup)

const posts: Post[] = [
  {
    id: "first",
    title: "First",
    slug: "first",
    excerpt: null,
    cover_image: "https://img.lunalbl.com/blog/first.webp",
    published: true,
    featured: false,
    created_at: "2026-08-03T00:00:00.000Z",
    updated_at: "2026-08-03T00:00:00.000Z",
    tags: [],
    category: null,
    view_count: 0,
  },
  {
    id: "second",
    title: "Second",
    slug: "second",
    excerpt: null,
    cover_image: "https://img.lunalbl.com/blog/second.webp",
    published: true,
    featured: false,
    created_at: "2026-08-03T00:00:00.000Z",
    updated_at: "2026-08-03T00:00:00.000Z",
    tags: [],
    category: null,
    view_count: 0,
  },
]

describe("PostGrid cover priority", () => {
  it("preloads only the first card cover", () => {
    render(<PostGrid posts={posts} />)

    expect(
      screen.getAllByTestId("post-card").map((card) =>
        card.getAttribute("data-preload-cover")
      )
    ).toEqual(["true", "false"])
  })
})
