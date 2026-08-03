// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import PostCard, { type Post } from "@/features/posts/components/post-card"

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useUser: () => ({ isAdmin: false }),
}))
vi.mock("@/features/posts/actions", () => ({
  toggleFeaturedStatus: vi.fn(),
}))
vi.mock("@/features/posts/components/delete-post-button", () => ({
  DeletePostButton: () => null,
}))

afterEach(cleanup)

const post: Post = {
  id: "post",
  title: "Responsive cover",
  slug: "responsive-cover",
  excerpt: "excerpt",
  cover_image: "https://img.lunalbl.com/blog/2026/08/cover.webp",
  published: true,
  featured: false,
  created_at: "2026-08-03T00:00:00.000Z",
  updated_at: "2026-08-03T00:00:00.000Z",
  tags: [],
  category: null,
  view_count: 0,
}

describe("PostCard cover sizing", () => {
  it("describes the rendered cover width at every grid breakpoint", () => {
    render(<PostCard post={post} />)

    expect(
      screen.getByRole("img", { name: post.title }).getAttribute("sizes")
    ).toBe(
      "(min-width: 1200px) 352px, (min-width: 1024px) calc((100vw - 96px) / 3), (min-width: 768px) calc((100vw - 72px) / 2), 35vw"
    )
  })
})
