import { createClient } from '@/lib/supabase/server'
import { AccessError, requireAdmin } from '@/lib/server-auth'
import { NextResponse } from 'next/server'
import { invalidatePublishedPosts } from '@/server/cache'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  try {
    await requireAdmin(supabase)
  } catch (error) {
    if (error instanceof AccessError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    throw error
  }

  // The shared guard and RLS both enforce administrator-only deletion.
  const { data: post } = await supabase
    .from('posts')
    .select('slug')
    .eq('slug', slug)
    .single()

  if (!post) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('slug', slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  invalidatePublishedPosts()
  return NextResponse.json({ success: true })
}
