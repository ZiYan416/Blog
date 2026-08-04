import { readFileSync } from "node:fs"
import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import {
  generatePostSlug,
} from "../src/server/slug"

describe("server slug helpers", () => {
  it("preserves the existing mixed Chinese and English slug output", () => {
    expect(generatePostSlug("你好 Next.js")).toBe("ni-hao-next-js")
    expect(generatePostSlug("Hello，世界！")).toBe("hello-shi-jie")
  })

  it("normalizes punctuation and returns an empty slug for unsupported input", () => {
    expect(generatePostSlug("  My_Custom Post  ")).toBe("my-custom-post")
    expect(generatePostSlug("🎉✨")).toBe("")
  })

  it("keeps pinyin behind the server-only boundary", () => {
    const serverSlugSource = readFileSync(
      new URL("../src/server/slug.ts", import.meta.url),
      "utf8"
    )
    const markdownSource = readFileSync(
      new URL("../src/lib/markdown.ts", import.meta.url),
      "utf8"
    )
    const postFormSource = readFileSync(
      new URL(
        "../src/features/posts/components/post-form.tsx",
        import.meta.url
      ),
      "utf8"
    )

    expect(serverSlugSource).toContain('import "server-only"')
    expect(serverSlugSource).toContain('from "pinyin"')
    expect(markdownSource).not.toContain("pinyin")
    expect(postFormSource).not.toContain("generatePostSlug")
    expect(postFormSource).not.toContain("@/server/slug")
  })
})
