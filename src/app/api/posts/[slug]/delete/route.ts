import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  // Check if post exists and user is the owner
  const { data: post } = await supabase
    .from('posts')
    .select('author_id, slug')
    .eq('slug', slug)
    .single()

  if (!post) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  if (post.author_id !== user.id) {
    return NextResponse.json({ error: '无权删除此文章' }, { status: 403 })
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('slug', slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
