import { createRouteHandlerClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { generatePostSlug } from '@/lib/markdown'

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const body = await request.json()
  const { title, content, excerpt, cover_image, tags, category, published } = body

  if (!title || !content) {
    return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 })
  }

  const slug = generatePostSlug(title)

  // Check if slug already exists
  const { data: existingPost } = await supabase
    .from('posts')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existingPost) {
    return NextResponse.json({ error: '标题已存在' }, { status: 400 })
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      title,
      slug,
      content,
      excerpt: excerpt || content.slice(0, 150),
      cover_image,
      tags: tags || [],
      category,
      published: published || false,
      author_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post })
}
