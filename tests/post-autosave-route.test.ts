import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const routeMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  requireAdmin: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: routeMocks.createClient,
}))

vi.mock("@/lib/server-auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/server-auth")>()
  return {
    ...actual,
    requireAdmin: routeMocks.requireAdmin,
  }
})

import { GET, PUT } from "@/app/api/posts/autosave/route"

interface QueryResult {
  data: unknown
  error: null | { code?: string; message: string }
}

function createBuilder(result: QueryResult) {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  builder.select.mockReturnValue(builder)
  builder.eq.mockReturnValue(builder)
  builder.is.mockReturnValue(builder)
  builder.order.mockReturnValue(builder)
  builder.limit.mockReturnValue(builder)
  builder.insert.mockReturnValue(builder)
  builder.update.mockReturnValue(builder)
  builder.delete.mockReturnValue(builder)
  return builder
}

function putRequest(body: unknown) {
  return new NextRequest("http://localhost/api/posts/autosave", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const snapshot = {
  title: "自动保存标题",
  slug: "autosave-title",
  content: "正文",
  coverImage: "",
  tags: ["Next.js"],
}

beforeEach(() => {
  vi.clearAllMocks()
  routeMocks.requireAdmin.mockResolvedValue({
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  })
})

describe("post autosave route", () => {
  it("rejects malformed query ids before reading a draft", async () => {
    const query = createBuilder({ data: null, error: null })
    routeMocks.createClient.mockResolvedValue({ from: vi.fn(() => query) })

    const response = await GET(
      new NextRequest("http://localhost/api/posts/autosave?postId=not-a-uuid"),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: "文章 ID 格式无效",
    })
    expect(query.maybeSingle).not.toHaveBeenCalled()
  })

  it("creates a separate working copy without writing the posts table", async () => {
    const findQuery = createBuilder({ data: null, error: null })
    const created = {
      id: "11111111-1111-4111-8111-111111111111",
      author_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      post_id: null,
      title: snapshot.title,
      slug: snapshot.slug,
      content: snapshot.content,
      cover_image: null,
      tags: snapshot.tags,
      base_post_updated_at: null,
      version: 1,
      created_at: "2026-08-10T12:00:00.000Z",
      updated_at: "2026-08-10T12:00:00.000Z",
    }
    const insertQuery = createBuilder({ data: created, error: null })
    const from = vi
      .fn()
      .mockReturnValueOnce(findQuery)
      .mockReturnValueOnce(insertQuery)
    routeMocks.createClient.mockResolvedValue({ from })

    const response = await PUT(
      putRequest({
        draftId: created.id,
        postId: null,
        basePostUpdatedAt: null,
        expectedVersion: null,
        snapshot,
      }),
    )

    expect(response.status).toBe(201)
    expect(from).toHaveBeenCalledTimes(2)
    expect(from).toHaveBeenNthCalledWith(1, "post_autosaves")
    expect(from).toHaveBeenNthCalledWith(2, "post_autosaves")
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: created.id,
        author_id: created.author_id,
        post_id: null,
        title: snapshot.title,
      }),
    )
  })

  it("updates with both autosave and post version guards", async () => {
    const postId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
    const draftId = "22222222-2222-4222-8222-222222222222"
    const basePostUpdatedAt = "2026-08-10T10:00:00.000Z"
    const postQuery = createBuilder({
      data: { id: postId, updated_at: basePostUpdatedAt },
      error: null,
    })
    const existing = {
      id: draftId,
      author_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      post_id: postId,
      title: "旧标题",
      slug: null,
      content: "旧正文",
      cover_image: null,
      tags: [],
      base_post_updated_at: "2026-08-09T10:00:00.000Z",
      version: 4,
      created_at: "2026-08-09T12:00:00.000Z",
      updated_at: "2026-08-10T11:00:00.000Z",
    }
    const findQuery = createBuilder({ data: existing, error: null })
    const updateQuery = createBuilder({
      data: {
        ...existing,
        ...{
          title: snapshot.title,
          slug: snapshot.slug,
          content: snapshot.content,
          tags: snapshot.tags,
          base_post_updated_at: basePostUpdatedAt,
          version: 5,
        },
      },
      error: null,
    })
    const from = vi
      .fn()
      .mockReturnValueOnce(postQuery)
      .mockReturnValueOnce(findQuery)
      .mockReturnValueOnce(updateQuery)
    routeMocks.createClient.mockResolvedValue({ from })

    const response = await PUT(
      putRequest({
        draftId,
        postId,
        basePostUpdatedAt,
        expectedVersion: 4,
        snapshot,
      }),
    )

    expect(response.status).toBe(200)
    expect(updateQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        base_post_updated_at: basePostUpdatedAt,
        version: 5,
      }),
    )
    expect(updateQuery.eq).toHaveBeenCalledWith("version", 4)
  })
})
