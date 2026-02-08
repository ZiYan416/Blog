import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    // 验证管理员权限
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 防止删除自己
    if (id === user.id) {
      return NextResponse.json(
        { error: '无法删除自己的账户' },
        { status: 400 }
      )
    }

    // 删除用户的 profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) throw profileError

    // 注意：这里只删除 profile，实际的 auth.users 需要通过 Supabase Admin API 删除
    // 如果需要完全删除用户，需要使用 Supabase Admin SDK

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除用户失败:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
