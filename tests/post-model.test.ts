import { describe, expect, it } from "vitest"
import {
  getTagLinks,
  getTagNames,
  mapPostTags,
  mapPostTagsWithLinks,
  type PostTagRelation,
} from "../src/features/posts/model"

const relations: PostTagRelation[] = [
  { tag: { name: "教程", slug: "jiao-cheng" } },
  { tag: { name: "Next.js", slug: "next-js" } },
  { tag: null },
]

describe("post tag mapping", () => {
  it("derives the public tag list from post_tags only", () => {
    const publicRelations = [
      { tag: { name: "Next.js", slug: "next-js" } },
      { tag: null },
      { tag: { name: "Supabase", slug: "supabase" } },
    ]

    expect(getTagNames(publicRelations)).toEqual(["Next.js", "Supabase"])
    expect(mapPostTags({ id: "post-1", post_tags: publicRelations })).toEqual({
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

describe("post tag link mapping", () => {
  it("preserves persisted tag names and slugs", () => {
    expect(getTagLinks(relations)).toEqual([
      { name: "教程", slug: "jiao-cheng" },
      { name: "Next.js", slug: "next-js" },
    ])
  })

  it("adds tag links without changing the existing tag name array", () => {
    expect(
      mapPostTagsWithLinks({ id: "post-1", post_tags: relations })
    ).toEqual({
      id: "post-1",
      tags: ["教程", "Next.js"],
      tagLinks: [
        { name: "教程", slug: "jiao-cheng" },
        { name: "Next.js", slug: "next-js" },
      ],
    })
  })
})
