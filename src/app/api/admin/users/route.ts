import { createClient as createServerClient } from '@/lib/supabase/server'
import { getManagedUsers } from '@/lib/admin-data'
import { apiError, getErrorMessage } from '@/lib/api-response'
import { NextResponse } from 'next/server'
import { AccessError, requireAdmin } from '@/lib/server-auth'

export async function GET() {
  try {
    const supabase = await createServerClient()

    await requireAdmin(supabase)

    return NextResponse.json({ users: await getManagedUsers(supabase) })
  } catch (error) {
    if (error instanceof AccessError) {
      return apiError(error.message, error.status, error.code)
    }
    console.error('获取用户列表失败:', error)
    return apiError(getErrorMessage(error), 500, 'USER_LIST_FAILED')
  }
}
