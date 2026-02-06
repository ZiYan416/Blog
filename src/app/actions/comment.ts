'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Comment {
  id: string
  content: string
  created_at: string
  approved: boolean
  profiles: {
    display_name: string | null
    avatar_url: string | null
    bio: string | null
    email?: string | null
    card_bg?: string | null
  }
}

export async function getComments(postId: string) {
  const supabase = await createClient()

  // 获取所有已审核的评论，关联查询用户信息
  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      approved,
      profiles:user_id (
        display_name,
        avatar_url,
        bio,
        email,
        card_bg
      )
    `)
    .eq('post_id', postId)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return (comments as unknown as Comment[]) || []
}

export async function submitComment(postId: string, formData: FormData) {
  const supabase = await createClient()
  const content = formData.get('content') as string

  if (!content) {
    return { error: '评论内容不能为空' }
  }

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
      approved: approved
    })

  if (error) {
    console.error('Error submitting comment:', error)
    return { error: '发表评论失败，请稍后重试' }
  }

  revalidatePath(`/post/[slug]`, 'page')
  return { success: true, approved }
}
