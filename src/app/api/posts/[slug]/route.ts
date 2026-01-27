import { createRouteHandlerClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { slug } = params

  const { data: post, error } = await supabase
    .from('posts')
    .select('*, profiles!author_id (id, email)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !post) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  // Increment view count
  await supabase
    .from('posts')
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq('id', post.id)

  return NextResponse.json({ post })
}
