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
import {
  getVisiblePost,
  getVisiblePostCards,
} from "@/server/repositories/posts"

describe("post repository visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("uses the request-aware server client for the initial article page", async () => {
    const draft = {
      id: "draft-1",
      public_id: 100000,
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
          public_id: 100000,
          title: "Draft",
          slug: "draft",
          published: false,
          tags: ["Draft tag"],
        },
      ],
      total: 1,
    })
  })

  it("uses request RLS when loading a draft detail", async () => {
    const draft = {
      id: "draft-1",
      public_id: 100000,
      title: "Draft",
      slug: "draft",
      published: false,
      content: "Draft content",
      post_tags: [],
    }
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn(),
    }
    query.select.mockReturnValue(query)
    query.eq.mockReturnValue(query)
    query.maybeSingle.mockResolvedValue({
      data: draft,
      error: null,
    })
    vi.mocked(createServerClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    } as never)

    const result = await getVisiblePost("draft")

    expect(createServerClient).toHaveBeenCalledOnce()
    expect(createPublicClient).not.toHaveBeenCalled()
    expect(result).toEqual({
      id: "draft-1",
      public_id: 100000,
      title: "Draft",
      slug: "draft",
      published: false,
      content: "Draft content",
      tags: [],
      tagLinks: [],
    })
    expect(query.eq).toHaveBeenCalledWith("slug", "draft")
  })

  it("loads canonical detail paths by public id", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn(),
    }
    query.select.mockReturnValue(query)
    query.eq.mockReturnValue(query)
    query.maybeSingle.mockResolvedValue({
      data: {
        id: "published-1",
        public_id: 100001,
        title: "Published",
        slug: "published",
        published: true,
        content: "Published content",
        post_tags: [],
      },
      error: null,
    })
    vi.mocked(createServerClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    } as never)

    const result = await getVisiblePost("100001")

    expect(query.eq).toHaveBeenCalledWith("public_id", 100001)
    expect(result?.public_id).toBe(100001)
  })
})
