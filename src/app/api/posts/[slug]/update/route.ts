import { createRouteHandlerClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { generatePostSlug } from '@/lib/markdown'

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  // Check if post exists and user is the owner
  const { data: existingPost } = await supabase
    .from('posts')
    .select('author_id')
    .eq('slug', params.slug)
    .single()

  if (!existingPost) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  if (existingPost.author_id !== user.id) {
    return NextResponse.json({ error: '无权修改此文章' }, { status: 403 })
  }

  const body = await request.json()
  const { title, content, excerpt, cover_image, tags, category, published } = body

  if (!title || !content) {
    return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 })
  }

  // Generate slug from title
  const slug = generatePostSlug(title)

  // Check if slug is different and doesn't exist
  if (slug !== params.slug) {
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .neq('id', existingPost.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: '标题已存在' }, { status: 400 })
    }
  }

  const { data: post, error } = await supabase
    .from('posts')
    .update({
      title,
      slug,
      content,
      excerpt: excerpt || content.slice(0, 150),
      cover_image,
      tags: tags || [],
      category,
      published: published !== undefined ? published : existingPost.published,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', params.slug)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post })
}
