import "server-only"

import { unstable_cache } from "next/cache"
import { createPublicClient } from "@/lib/supabase/public"

export interface Comment {
  id: string
  content: string
  created_at: string
  approved: boolean
  parent_id: string | null
  reply_count: number
  profiles: {
    display_name: string | null
    avatar_url: string | null
    bio: string | null
    email?: string | null
    card_bg?: string | null
  }
  replies?: Comment[]
}

interface CommentRow {
  id: string
  user_id: string
  content: string
  created_at: string
  approved: boolean
  parent_id: string | null
  reply_count: number
}

interface PublicCommentProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  card_bg: string | null
}

async function queryComments(postId: string): Promise<Comment[]> {
  const supabase = createPublicClient()
  const [
    { data: comments, error },
    { data: profileRows, error: profileError },
  ] = await Promise.all([
    supabase
      .from("comments")
      .select(
        "id, user_id, content, created_at, approved, parent_id, reply_count"
      )
      .eq("post_id", postId)
      .eq("approved", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("public_profiles")
      .select("id, display_name, avatar_url, bio, card_bg"),
  ])

  if (error) throw error
  if (profileError) throw profileError

  const commentRows = (comments || []) as CommentRow[]
  const referencedUserIds = new Set(commentRows.map((comment) => comment.user_id))
  const profileById = new Map(
    ((profileRows || []) as PublicCommentProfile[])
      .filter((profile) => referencedUserIds.has(profile.id))
      .map((profile) => [profile.id, profile])
  )

  const commentMap = new Map<string, Comment>()
  const rootComments: Comment[] = []

  for (const comment of commentRows) {
    const profile = profileById.get(comment.user_id)
    commentMap.set(comment.id, {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      approved: comment.approved,
      parent_id: comment.parent_id,
      reply_count: comment.reply_count,
      profiles: {
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null,
        bio: profile?.bio || null,
        card_bg: profile?.card_bg || null,
      },
      replies: [],
    })
  }

  for (const comment of commentRows) {
    const current = commentMap.get(comment.id)
    if (!current) continue

    if (comment.parent_id) {
      commentMap.get(comment.parent_id)?.replies?.push(current)
    } else {
      rootComments.push(current)
    }
  }

  for (const comment of rootComments) {
    comment.replies?.sort(
      (left, right) =>
        new Date(left.created_at).getTime() -
        new Date(right.created_at).getTime()
    )
  }

  return rootComments
}

export const getComments = unstable_cache(
  queryComments,
  ["approved-comments"],
  { revalidate: 60, tags: ["comments"] }
)
