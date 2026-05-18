import { createClient as createServerClient } from '@/lib/supabase/server'
import { apiError, getErrorMessage } from '@/lib/api-response'
import { NextResponse } from 'next/server'

// 审核评论（批准）
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const supabase = await createServerClient()

    // 验证管理员权限
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return apiError('未授权', 401, 'UNAUTHORIZED')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return apiError('需要管理员权限', 403, 'FORBIDDEN')
    }

    // 批准评论
    const { error } = await supabase
      .from('comments')
      .update({ approved: true, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('批准评论失败:', error)
    return apiError(getErrorMessage(error), 500, 'COMMENT_APPROVE_FAILED')
  }
}

// 删除评论
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const supabase = await createServerClient()

    // 验证管理员权限
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return apiError('未授权', 401, 'UNAUTHORIZED')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return apiError('需要管理员权限', 403, 'FORBIDDEN')
    }

    // 删除评论
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除评论失败:', error)
    return apiError(getErrorMessage(error), 500, 'COMMENT_DELETE_FAILED')
  }
}
