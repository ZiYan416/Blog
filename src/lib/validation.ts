import { z } from "zod";

const optionalShortText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null);

export const postPayloadSchema = z
  .object({
    title: z.string().trim().min(1, "标题不能为空").max(200, "标题不能超过 200 个字符"),
    slug: z.string().trim().max(200, "链接别名不能超过 200 个字符").optional().nullable(),
    content: z
      .string()
      .trim()
      .min(1, "内容不能为空")
      .max(2_000_000, "文章内容过长"),
    excerpt: optionalShortText(500),
    cover_image: optionalShortText(2_048),
    tags: z
      .array(z.string().trim().min(1).max(50))
      .max(20, "单篇文章最多使用 20 个标签")
      .default([])
      .transform((tags) => [...new Set(tags)]),
    category: optionalShortText(80),
    published: z.boolean().default(false),
  })
  .strict();

export const postListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
  category: z.string().trim().max(80).optional(),
  tag: z.string().trim().max(50).optional(),
  search: z.string().trim().max(100).optional(),
  featured: z.enum(["true", "false"]).optional(),
  sort: z.enum(["latest", "oldest", "views"]).default("latest"),
});

export const commentSubmissionSchema = z.object({
  postId: z.uuid(),
  parentId: z.uuid().nullable().optional(),
  content: z.string().trim().min(1, "评论内容不能为空").max(5_000, "评论不能超过 5000 个字符"),
});

export function getValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message || "请求参数无效";
}

export function buildPostSearchFilter(search: string) {
  const escaped = search.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pattern = `*${escaped}*`;

  return [
    `title.ilike."${pattern}"`,
    `excerpt.ilike."${pattern}"`,
    `content.ilike."${pattern}"`,
  ].join(",");
}
