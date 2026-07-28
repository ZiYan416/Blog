import { createClient as createServerClient } from '@/lib/supabase/server'
import { apiError, getErrorMessage } from '@/lib/api-response'
import { NextResponse } from 'next/server'
import { AccessError, requireAdmin } from '@/lib/server-auth'
import { invalidatePublishedComments } from '@/server/cache'

// 审核评论（批准）
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const supabase = await createServerClient()

    await requireAdmin(supabase)

    // 批准评论
    const { error } = await supabase
      .from('comments')
      .update({ approved: true, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    if (error) throw error

    invalidatePublishedComments()
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AccessError) {
      return apiError(error.message, error.status, error.code)
    }
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

    await requireAdmin(supabase)

    // 删除评论
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    invalidatePublishedComments()
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AccessError) {
      return apiError(error.message, error.status, error.code)
    }
    console.error('删除评论失败:', error)
    return apiError(getErrorMessage(error), 500, 'COMMENT_DELETE_FAILED')
  }
}
