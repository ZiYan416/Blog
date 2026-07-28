import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}))
vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: vi.fn(),
}))
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}))

import { createPublicClient } from "@/lib/supabase/public"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getVisiblePostCards } from "@/server/repositories/posts"

describe("post repository visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("uses the request-aware server client for the initial article page", async () => {
    const draft = {
      id: "draft-1",
      title: "Draft",
      slug: "draft",
      published: false,
      post_tags: [{ tag: { name: "Draft tag", slug: "draft-tag" } }],
    }
    const query = {
      select: vi.fn(),
      order: vi.fn(),
      range: vi.fn(),
    }
    query.select.mockReturnValue(query)
    query.order.mockReturnValue(query)
    query.range.mockResolvedValue({
      data: [draft],
      error: null,
      count: 1,
    })
    vi.mocked(createServerClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    } as never)

    const result = await getVisiblePostCards(9)

    expect(createServerClient).toHaveBeenCalledOnce()
    expect(createPublicClient).not.toHaveBeenCalled()
    expect(result).toEqual({
      posts: [
        {
          id: "draft-1",
          title: "Draft",
          slug: "draft",
          published: false,
          tags: ["Draft tag"],
        },
      ],
      total: 1,
    })
  })
})
