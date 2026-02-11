import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
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

    // 获取所有用户及其评论数
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        display_name,
        avatar_url,
        bio,
        is_admin,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // 获取每个用户的评论数
    const usersWithCommentCount = await Promise.all(
      (users || []).map(async (user) => {
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        return {
          ...user,
          comment_count: count || 0,
        }
      })
    )

    return NextResponse.json({ users: usersWithCommentCount })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
