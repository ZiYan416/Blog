import { createClient as createServerClient } from '@/lib/supabase/server'
import { apiError, getErrorMessage } from '@/lib/api-response'
import { NextResponse } from 'next/server'
import { AccessError, requireAdmin } from '@/lib/server-auth'

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const supabase = await createServerClient()

    const user = await requireAdmin(supabase)

    // 防止修改自己的管理员状态
    if (params.id === user.id) {
      return apiError('无法修改自己的管理员状态', 400, 'SELF_ROLE_CHANGE_NOT_ALLOWED')
    }

    // 获取请求体
    const body = await request.json()
    const { is_admin } = body

    if (typeof is_admin !== 'boolean') {
      return apiError('无效的参数', 400, 'INVALID_ARGUMENT')
    }

    // Role changes go through a SECURITY DEFINER RPC so authenticated users
    // never receive direct UPDATE privileges for profiles.is_admin.
    const { error: updateError } = await supabase
      .rpc('set_user_admin', {
        target_user_id: params.id,
        enabled: is_admin,
      })

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: is_admin ? '已设为管理员' : '已取消管理员权限'
    })
  } catch (error) {
    if (error instanceof AccessError) {
      return apiError(error.message, error.status, error.code)
    }
    console.error('更新管理员状态失败:', error)
    return apiError(getErrorMessage(error), 500, 'ROLE_UPDATE_FAILED')
  }
}
