// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest"
import { uploadBlogImage, uploadBlogImages } from "../src/features/posts/image-upload"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("blog image upload deduplication", () => {
  it("uploads identical files once while preserving both insertion results", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ url: "https://img.lunalbl.com/deduplicated-image" }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    const first = new File(["same-image-content"], "first.png", {
      type: "image/png",
    })
    const second = new File(["same-image-content"], "second.png", {
      type: "image/png",
    })

    const results = await uploadBlogImages([first, second])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(results).toEqual([
      { file: first, url: "https://img.lunalbl.com/deduplicated-image" },
      { file: second, url: "https://img.lunalbl.com/deduplicated-image" },
    ])
  })

  it("removes failed uploads from the cache so they can be retried", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "图床服务暂时不可用" }), {
          status: 502,
          headers: { "content-type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ url: "https://img.lunalbl.com/retried-image" }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          }
        )
      )
    vi.stubGlobal("fetch", fetchMock)

    const file = new File(["retry-image-content"], "retry.webp", {
      type: "image/webp",
    })

    await expect(uploadBlogImage(file)).rejects.toThrow("图床服务暂时不可用")
    await expect(uploadBlogImage(file)).resolves.toBe(
      "https://img.lunalbl.com/retried-image"
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("sends the cover purpose without changing existing upload fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ url: "https://img.lunalbl.com/cover.webp" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    )
    vi.stubGlobal("fetch", fetchMock)
    const file = new File(["unique-cover-content"], "cover.png", {
      type: "image/png",
    })

    await uploadBlogImage(file, {
      articlePublicId: 100015,
      purpose: "cover",
    })

    const request = fetchMock.mock.calls[0][1] as RequestInit
    const body = request.body as FormData
    expect(body.get("file")).toBe(file)
    expect(body.get("articlePublicId")).toBe("100015")
    expect(body.get("purpose")).toBe("cover")
  })
})
