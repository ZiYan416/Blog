import { createClient as createServerClient } from '@/lib/supabase/server'
import { getManagedUsers } from '@/lib/admin-data'
import { apiError, getErrorMessage } from '@/lib/api-response'
import { NextResponse } from 'next/server'

export async function GET() {
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

    return NextResponse.json({ users: await getManagedUsers(supabase) })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return apiError(getErrorMessage(error), 500, 'USER_LIST_FAILED')
  }
}
