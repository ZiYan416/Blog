import sharp from "sharp"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  parseImageUploadPurpose,
  prepareImageForStorage,
  storeBlogImage,
} from "@/server/image-storage"

async function createImageFile(
  name: string,
  type: "png" | "avif",
  width: number,
  height: number
) {
  const buffer = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 34, g: 86, b: 153, alpha: 0.8 },
    },
  })
    [type]()
    .toBuffer()

  return new File([new Uint8Array(buffer)], name, {
    type: `image/${type}`,
    lastModified: 123,
  })
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe("cover image preprocessing", () => {
  it("leaves content uploads untouched", async () => {
    const image = await createImageFile("content.png", "png", 64, 64)

    await expect(prepareImageForStorage(image, "content")).resolves.toBe(image)
  })

  it("rotates and converts a static cover to WebP", async () => {
    const image = await createImageFile("cover.png", "png", 800, 450)
    const prepared = await prepareImageForStorage(image, "cover")
    const metadata = await sharp(await prepared.arrayBuffer()).metadata()

    expect(prepared).not.toBe(image)
    expect(prepared.name).toBe("cover.webp")
    expect(prepared.type).toBe("image/webp")
    expect(prepared.lastModified).toBe(123)
    expect(metadata).toMatchObject({ format: "webp", width: 800, height: 450 })
  })

  it("limits oversized covers to 3840 pixels without enlarging", async () => {
    const image = await createImageFile("wide.png", "png", 4000, 20)
    const prepared = await prepareImageForStorage(image, "cover")
    const metadata = await sharp(await prepared.arrayBuffer()).metadata()

    expect(metadata.width).toBe(3840)
    expect(metadata.height).toBeLessThanOrEqual(20)
  })

  it("preserves animated images instead of flattening their frames", async () => {
    const animated = Buffer.from(
      "47494638396101000100800000000000ffffff21ff0b4e45545343415045322e30030100000021f904000a0000002c000000000100010000020244010021f904000a0000002c00000000010001000002024c01003b",
      "hex"
    )
    const image = new File([new Uint8Array(animated)], "animated.gif", {
      type: "image/gif",
    })

    const metadata = await sharp(animated, { animated: true }).metadata()
    expect(metadata.pages).toBeGreaterThan(1)
    await expect(prepareImageForStorage(image, "cover")).resolves.toBe(image)
  })

  it("falls back to the original when Sharp cannot decode the image", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const invalid = new File(["not-an-image"], "broken.png", {
      type: "image/png",
    })

    await expect(prepareImageForStorage(invalid, "cover")).resolves.toBe(invalid)
  })

  it("converts an AVIF cover before the Supabase compatibility check", async () => {
    vi.stubEnv("IMGBED_API_TOKEN", "")
    const image = await createImageFile("cover.avif", "avif", 64, 64)
    const upload = vi.fn().mockResolvedValue({ error: null })
    const getPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: "https://project.supabase.co/cover.webp" },
    })
    const supabase = {
      storage: {
        from: vi.fn().mockReturnValue({ upload, getPublicUrl }),
      },
    }

    await storeBlogImage(supabase as never, image, { purpose: "cover" })

    const [filePath, uploadedFile, options] = upload.mock.calls[0]
    expect(filePath).toMatch(/\.webp$/)
    expect(uploadedFile.type).toBe("image/webp")
    expect(options).toMatchObject({
      cacheControl: "31536000",
      contentType: "image/webp",
      upsert: false,
    })
  })
})

describe("image upload purpose", () => {
  it.each([
    [null, "content"],
    ["", "content"],
    ["content", "content"],
    ["cover", "cover"],
  ] as const)("parses %s as %s", (value, expected) => {
    expect(parseImageUploadPurpose(value)).toBe(expected)
  })

  it("rejects unknown purposes", () => {
    expect(() => parseImageUploadPurpose("avatar")).toThrowError(
      expect.objectContaining({
        status: 400,
        code: "INVALID_IMAGE_PURPOSE",
      })
    )
  })
})
