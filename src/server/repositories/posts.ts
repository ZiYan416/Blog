import "server-only"

import { unstable_cache } from "next/cache"
import {
  mapPostTags,
  mapPostTagsWithLinks,
  POST_CARD_SELECT,
  POST_DETAIL_SELECT,
} from "@/features/posts/model"
import { createPublicClient } from "@/lib/supabase/public"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { buildPostSearchFilter } from "@/lib/validation"
import { parsePostPublicId } from "@/features/posts/post-path"

const CACHE_SECONDS = 300

async function queryFeaturedPosts() {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from("posts")
    .select(POST_CARD_SELECT)
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(4)

  if (error) throw error
  return (data || []).map(mapPostTags)
}

export async function getVisiblePostCards(limit: number) {
  const supabase = await createServerClient()
  const { data, error, count } = await supabase
    .from("posts")
    .select(POST_CARD_SELECT, { count: "exact" })
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(0, Math.max(0, limit - 1))

  if (error) throw error
  return {
    posts: (data || []).map(mapPostTags),
    total: count || 0,
  }
}

export async function getVisiblePost(identifier: string) {
  const supabase = await createServerClient()
  const publicId = parsePostPublicId(identifier)
  let query = supabase
    .from("posts")
    .select(POST_DETAIL_SELECT)

  query = publicId === null
    ? query.eq("slug", identifier)
    : query.eq("public_id", publicId)

  const { data, error } = await query.maybeSingle()

  if (error) throw error
  return data ? mapPostTagsWithLinks(data) : null
}

async function queryTag(slug: string) {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle()

  if (error) throw error
  return data
}

async function queryPostsByTag(tagId: string, limit: number) {
  const supabase = createPublicClient()
  const { data, error, count } = await supabase
    .from("posts")
    .select(
      `${POST_CARD_SELECT}, matching_tags:post_tags!inner(tag_id)`,
      { count: "exact" }
    )
    .eq("matching_tags.tag_id", tagId)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(0, Math.max(0, limit - 1))

  if (error) throw error

  return {
    posts: (data || []).map(({ matching_tags, ...post }) => {
      void matching_tags
      return mapPostTags(post)
    }),
    total: count || 0,
  }
}

async function querySearchResults(search: string, limit: number) {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from("posts")
    .select(POST_CARD_SELECT)
    .or(buildPostSearchFilter(search))
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []).map(mapPostTags)
}

export const getFeaturedPosts = unstable_cache(
  queryFeaturedPosts,
  ["featured-posts"],
  { revalidate: CACHE_SECONDS, tags: ["posts"] }
)

export const getTagBySlug = unstable_cache(queryTag, ["tag-by-slug"], {
  revalidate: CACHE_SECONDS,
  tags: ["tags"],
})

export const getPublishedPostsByTag = unstable_cache(
  queryPostsByTag,
  ["published-posts-by-tag"],
  { revalidate: CACHE_SECONDS, tags: ["posts", "tags"] }
)

export const searchPublishedPosts = unstable_cache(
  querySearchResults,
  ["search-published-posts"],
  { revalidate: CACHE_SECONDS, tags: ["posts"] }
)
