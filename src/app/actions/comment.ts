'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { commentSubmissionSchema, getValidationMessage } from '@/lib/validation'

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

export async function getComments(postId: string) {
  const supabase = await createClient()

  // Public profile data is intentionally read through a restricted projection;
  // the private profiles table contains email and authorization fields.
  const { data: comments, error } = await supabase
    .from('comments')
    .select('id, user_id, content, created_at, approved, parent_id, reply_count')
    .eq('post_id', postId)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  const commentRows = (comments || []) as CommentRow[]
  const userIds = [...new Set(commentRows.map((comment) => comment.user_id))]
  const { data: profileRows, error: profileError } = userIds.length
    ? await supabase
        .from('public_profiles')
        .select('id, display_name, avatar_url, bio, card_bg')
        .in('id', userIds)
    : { data: [] as PublicCommentProfile[], error: null }

  if (profileError) {
    console.error('Error fetching public comment profiles:', profileError)
  }

  const profileById = new Map(
    ((profileRows || []) as PublicCommentProfile[]).map((profile) => [
      profile.id,
      profile,
    ])
  )

  const flatComments: Comment[] = commentRows.map((comment) => {
    const profile = profileById.get(comment.user_id)

    return {
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
    }
  })

  // 构建评论树结构：将评论分为顶级评论和回复
  const commentMap = new Map<string, Comment>()
  const rootComments: Comment[] = []

  // 第一遍：将所有评论放入 Map，并初始化 replies 数组
  flatComments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // 第二遍：构建树结构
  flatComments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!

    if (comment.parent_id) {
      // 这是一个回复，添加到父评论的 replies 中
      const parent = commentMap.get(comment.parent_id)
      if (parent) {
        parent.replies!.push(commentWithReplies)
      }
    } else {
      // 这是一个顶级评论
      rootComments.push(commentWithReplies)
    }
  })

  // 对每个评论的回复按时间正序排序（最早的在前）
  rootComments.forEach(comment => {
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }
  })

  return rootComments
}

export async function submitComment(postId: string, formData: FormData, parentId?: string | null) {
  const supabase = await createClient()
  const parsedSubmission = commentSubmissionSchema.safeParse({
    postId,
    parentId: parentId || null,
    content: formData.get('content'),
  })

  if (!parsedSubmission.success) {
    return { error: getValidationMessage(parsedSubmission.error) }
  }

  const { content, parentId: validatedParentId } = parsedSubmission.data
  // 检查当前用户是否登录
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录' }
  }

  // 检查是否为管理员，如果是管理员发表评论，直接通过
  let approved = false
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_admin) {
    approved = true
  }

  const { error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id, // 使用当前登录用户的 ID
      content,
      approved: approved,
      parent_id: validatedParentId || null
    })

  if (error) {
    console.error('Error submitting comment:', error)
    return { error: '发表评论失败，请稍后重试' }
  }

  revalidatePath(`/post/[slug]`, 'page')
  return { success: true, approved }
}
