import type { Database } from "@/db/database.types"

export const POST_CARD_SELECT =
  "id, title, slug, excerpt, cover_image, published, featured, created_at, updated_at, category, view_count, author_id, post_tags(tag:tags(name, slug))" as const

export const POST_DETAIL_SELECT =
  "id, title, slug, content, excerpt, cover_image, published, featured, created_at, updated_at, category, view_count, author_id, post_tags(tag:tags(name, slug))" as const

export interface PostTagRelation {
  tag: {
    name: string
    slug: string
  } | null
}

export interface PostTagLink {
  name: string
  slug: string
}

export type PostRow = Database["public"]["Tables"]["posts"]["Row"]

export type PostWithTagRelations = PostRow & {
  post_tags?: PostTagRelation[] | null
}

export function getTagNames(
  relations: readonly PostTagRelation[] | null | undefined
): string[] {
  if (!relations) return []

  return relations.flatMap((relation) =>
    relation.tag?.name ? [relation.tag.name] : []
  )
}

export function getTagLinks(
  relations: readonly PostTagRelation[] | null | undefined
): PostTagLink[] {
  if (!relations) return []

  return relations.flatMap((relation) =>
    relation.tag?.name && relation.tag.slug
      ? [{ name: relation.tag.name, slug: relation.tag.slug }]
      : []
  )
}

export function mapPostTags<T extends { post_tags?: PostTagRelation[] | null }>(
  post: T
): Omit<T, "post_tags"> & { tags: string[] } {
  const { post_tags: relations, ...rest } = post

  return {
    ...rest,
    tags: getTagNames(relations),
  }
}

export function mapPostTagsWithLinks<
  T extends { post_tags?: PostTagRelation[] | null },
>(post: T): Omit<T, "post_tags"> & {
  tags: string[]
  tagLinks: PostTagLink[]
} {
  const { post_tags: relations, ...rest } = post
  const tagLinks = getTagLinks(relations)

  return {
    ...rest,
    tags: tagLinks.map((tag) => tag.name),
    tagLinks,
  }
}
