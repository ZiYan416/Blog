import { describe, expect, it } from "vitest"
import { getTagNames, mapPostTags } from "../src/features/posts/model"

describe("post tag mapping", () => {
  it("derives the public tag list from post_tags only", () => {
    const relations = [
      { tag: { name: "Next.js", slug: "next-js" } },
      { tag: null },
      { tag: { name: "Supabase", slug: "supabase" } },
    ]

    expect(getTagNames(relations)).toEqual(["Next.js", "Supabase"])
    expect(
      mapPostTags({ id: "post-1", post_tags: relations })
    ).toEqual({
      id: "post-1",
      tags: ["Next.js", "Supabase"],
    })
  })

  it("uses an empty tag list when no relationships exist", () => {
    expect(mapPostTags({ id: "post-1", post_tags: null })).toEqual({
      id: "post-1",
      tags: [],
    })
  })
})
