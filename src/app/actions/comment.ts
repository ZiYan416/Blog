'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Comment {
  id: string
  content: string
  author_name: string
  created_at: string
  approved: boolean
}

export async function getComments(postId: string) {
  const supabase = await createClient()

  // 获取所有已审核的评论，按时间倒序排列
  const { data: comments } = await supabase
    .from('comments')
    .select('id, content, author_name, created_at, approved')
    .eq('post_id', postId)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  return comments || []
}

export async function submitComment(postId: string, formData: FormData) {
  const supabase = await createClient()
  const content = formData.get('content') as string
  const authorName = formData.get('authorName') as string || '匿名用户'
  const authorEmail = formData.get('authorEmail') as string || ''

  if (!content) {
    return { error: '评论内容不能为空' }
  }

  // 检查当前用户是否登录
  const { data: { user } } = await supabase.auth.getUser()

  // 如果是管理员或者登录用户，可能希望自动通过审核（这里暂时只让管理员自动通过，或者默认都需要审核）
  // 为了简化体验，我们先假设所有评论默认 approved = false (需要审核)，
  // 除非我们想让它直接显示 (approved = true)。
  // 查看之前的 schema，RLS 策略允许 authenticated users 插入。

  // 检查是否为管理员，如果是管理员发表评论，直接通过
  let approved = false
  if (user) {
     const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
     if (profile?.is_admin) {
       approved = true
     }
  }

  const { error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      content,
      author_name: authorName,
      author_email: authorEmail, // 注意：数据库中要有这个字段
      approved: approved
    })

  if (error) {
    console.error('Error submitting comment:', error)
    return { error: '发表评论失败，请稍后重试' }
  }

  revalidatePath(`/post/[slug]`) // 这里其实很难精确获知 slug，可以在组件端处理刷新
  return { success: true, approved }
}
