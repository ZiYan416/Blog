import { describe, expect, it } from "vitest"
import {
  getPostPath,
  parsePostPublicId,
} from "../src/features/posts/post-path"

describe("post public paths", () => {
  it("builds the canonical path from a six or seven digit public id", () => {
    expect(getPostPath(100000)).toBe("/post/100000")
    expect(getPostPath(1234567)).toBe("/post/1234567")
  })

  it("recognizes public ids without treating legacy slugs as numbers", () => {
    expect(parsePostPublicId("100000")).toBe(100000)
    expect(parsePostPublicId("1234567")).toBe(1234567)
    expect(parsePostPublicId("99999")).toBeNull()
    expect(parsePostPublicId("microsoft-rewards")).toBeNull()
  })

  it("rejects invalid public ids when building links", () => {
    expect(() => getPostPath(99999)).toThrow(RangeError)
    expect(() => getPostPath(100000.5)).toThrow(RangeError)
  })
})
