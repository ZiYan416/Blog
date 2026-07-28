'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { commentSubmissionSchema, getValidationMessage } from '@/lib/validation'
import { invalidatePublishedComments } from '@/server/cache'

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

  invalidatePublishedComments()
  revalidatePath(`/post/[slug]`, 'page')
  return { success: true, approved }
}
