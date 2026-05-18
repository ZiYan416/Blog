import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiError, getErrorMessage } from '@/lib/api-response'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const { id } = await params
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

    // 防止删除自己
    if (id === user.id) {
      return apiError('无法删除自己的账户', 400, 'SELF_DELETE_NOT_ALLOWED')
    }

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', id)
      .maybeSingle()

    if (!targetProfile) {
      return apiError('用户不存在', 404, 'USER_NOT_FOUND')
    }

    const adminSupabase = createAdminClient()
    const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(id)

    if (authDeleteError) {
      return apiError(authDeleteError.message, 500, 'AUTH_USER_DELETE_FAILED')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除用户失败:', error)
    return apiError(getErrorMessage(error), 500, 'USER_DELETE_FAILED')
  }
}
