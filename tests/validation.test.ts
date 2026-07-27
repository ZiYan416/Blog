import { describe, expect, it } from "vitest";
import {
  buildPostSearchFilter,
  commentSubmissionSchema,
  postListQuerySchema,
  postPayloadSchema,
} from "../src/lib/validation";

describe("postPayloadSchema", () => {
  it("normalizes text and removes duplicate tags", () => {
    const result = postPayloadSchema.parse({
      title: "  一篇文章  ",
      slug: "  custom-post-slug  ",
      content: "  正文  ",
      tags: ["Next.js", "Next.js", "  Supabase  "],
      published: true,
    });

    expect(result.title).toBe("一篇文章");
    expect(result.content).toBe("正文");
    expect(result.slug).toBe("custom-post-slug");
    expect(result.tags).toEqual(["Next.js", "Supabase"]);
    expect(result.excerpt).toBeNull();
  });

  it("rejects unexpected fields and oversized tag lists", () => {
    expect(() =>
      postPayloadSchema.parse({
        title: "文章",
        content: "正文",
        tags: Array.from({ length: 21 }, (_, index) => `tag-${index}`),
        is_admin: true,
      })
    ).toThrow();
  });
});

describe("postListQuerySchema", () => {
  it("applies defaults and numeric coercion", () => {
    expect(postListQuerySchema.parse({})).toMatchObject({
      page: 1,
      limit: 9,
      sort: "latest",
    });
    expect(postListQuerySchema.parse({ page: "2", limit: "20" })).toMatchObject({
      page: 2,
      limit: 20,
    });
  });

  it("rejects abusive pagination values", () => {
    expect(postListQuerySchema.safeParse({ limit: "5000" }).success).toBe(false);
    expect(postListQuerySchema.safeParse({ page: "-1" }).success).toBe(false);
  });
});

describe("commentSubmissionSchema", () => {
  it("trims valid comments and rejects invalid identifiers", () => {
    const parsed = commentSubmissionSchema.parse({
      postId: "7df6c07f-50e4-49ee-9cf0-b9e1ec4e6c63",
      content: "  有帮助的评论  ",
      parentId: null,
    });

    expect(parsed.content).toBe("有帮助的评论");
    expect(
      commentSubmissionSchema.safeParse({
        postId: "not-a-uuid",
        content: "评论",
      }).success
    ).toBe(false);
  });
});

describe("buildPostSearchFilter", () => {
  it("quotes PostgREST reserved syntax", () => {
    expect(buildPostSearchFilter('a",published.eq.false')).toBe(
      'title.ilike."*a\\",published.eq.false*",excerpt.ilike."*a\\",published.eq.false*",content.ilike."*a\\",published.eq.false*"'
    );
  });
});
