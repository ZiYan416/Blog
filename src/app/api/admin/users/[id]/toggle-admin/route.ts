import { createClient as createServerClient } from '@/lib/supabase/server'
import { apiError, getErrorMessage } from '@/lib/api-response'
import { NextResponse } from 'next/server'

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

    // 更新用户的管理员状态
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin })
      .eq('id', params.id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: is_admin ? '已设为管理员' : '已取消管理员权限'
    })
  } catch (error) {
    console.error('更新管理员状态失败:', error)
    return apiError(getErrorMessage(error), 500, 'ROLE_UPDATE_FAILED')
  }
}
