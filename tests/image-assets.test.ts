import { describe, expect, it } from "vitest"
import {
  extractManagedImageAssets,
  getManagedImageKey,
  parseManagedImageUrl,
} from "@/features/posts/image-assets"
import {
  buildImageUploadFolder,
  validateImageFile,
} from "@/server/image-storage"

const SUPABASE_URL = "https://project.supabase.co"

describe("managed post image assets", () => {
  it("parses ImgBed file and public URLs inside the blog namespace", () => {
    expect(
      parseManagedImageUrl(
        "https://img.lunalbl.com/file/blog/2026/07/a.webp",
        SUPABASE_URL
      )
    ).toMatchObject({
      provider: "imgbed",
      fileId: "blog/2026/07/a.webp",
    })
    expect(
      parseManagedImageUrl(
        "https://img.lunalbl.com/blog/2026/07/a.webp",
        SUPABASE_URL
      )
    ).toMatchObject({
      provider: "imgbed",
      fileId: "blog/2026/07/a.webp",
    })
  })

  it("refuses to manage non-blog ImgBed files", () => {
    expect(
      parseManagedImageUrl(
        "https://img.lunalbl.com/file/private/avatar.webp",
        SUPABASE_URL
      )
    ).toBeNull()
  })

  it("refuses lookalike ImgBed origins", () => {
    expect(
      parseManagedImageUrl(
        "https://img.lunalbl.com:444/file/blog/2026/07/a.webp",
        SUPABASE_URL
      )
    ).toBeNull()
    expect(
      parseManagedImageUrl(
        "https://img.lunalbl.com.evil.example/file/blog/2026/07/a.webp",
        SUPABASE_URL
      )
    ).toBeNull()
  })

  it("deduplicates equivalent managed URLs in article content", () => {
    const assets = extractManagedImageAssets(
      [
        "![one](https://img.lunalbl.com/file/blog/2026/07/a.webp)",
        '<img src="https://img.lunalbl.com/file/blog/2026/07/a.webp">',
        "![two](https://project.supabase.co/storage/v1/object/public/blog-images/blog/2026/07/b.png)",
      ].join("\n"),
      null,
      SUPABASE_URL
    )

    expect(assets.map(getManagedImageKey)).toEqual([
      "imgbed:blog/2026/07/a.webp",
      "supabase:blog/2026/07/b.png",
    ])
  })
})

describe("image upload folder", () => {
  it("builds a blog year/month folder with a safe article slug", () => {
    expect(
      buildImageUploadFolder(
        { articleSlug: "cloudflare-imgbed" },
        new Date("2026-07-29T00:00:00Z")
      )
    ).toBe("blog/2026/07/cloudflare-imgbed")
  })

  it.each(["../secret", "%252e%252e/secret", "\\absolute", "/absolute"])(
    "rejects unsafe folder hint %s",
    (folder) => {
      expect(() =>
        buildImageUploadFolder(
          { folder },
          new Date("2026-07-29T00:00:00Z")
        )
      ).toThrow("图片目录格式无效")
    }
  )
})

describe("image validation", () => {
  it("accepts a PNG with a matching file signature", async () => {
    const file = new File(
      [
        new Uint8Array([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
        ]),
      ],
      "image.png",
      { type: "image/png" }
    )

    await expect(validateImageFile(file)).resolves.toBeUndefined()
  })

  it("rejects a non-image MIME type", async () => {
    const file = new File(["plain text"], "note.txt", {
      type: "text/plain",
    })

    await expect(validateImageFile(file)).rejects.toMatchObject({
      status: 415,
      code: "UNSUPPORTED_IMAGE_TYPE",
    })
  })

  it("rejects a spoofed image MIME type", async () => {
    const file = new File(["not actually a png"], "fake.png", {
      type: "image/png",
    })

    await expect(validateImageFile(file)).rejects.toMatchObject({
      status: 415,
      code: "INVALID_IMAGE_CONTENT",
    })
  })
})
