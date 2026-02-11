import { createClient as createServerClient } from '@/lib/supabase/server'
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
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    // 防止修改自己的管理员状态
    if (params.id === user.id) {
      return NextResponse.json(
        { error: '无法修改自己的管理员状态' },
        { status: 400 }
      )
    }

    // 获取请求体
    const body = await request.json()
    const { is_admin } = body

    if (typeof is_admin !== 'boolean') {
      return NextResponse.json(
        { error: '无效的参数' },
        { status: 400 }
      )
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
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
