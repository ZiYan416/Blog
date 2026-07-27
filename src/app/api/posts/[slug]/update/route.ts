import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { generatePostSlug, getPostExcerpt } from '@/lib/markdown'
import { AccessError, requireAdmin } from '@/lib/server-auth'
import { getValidationMessage, postPayloadSchema } from '@/lib/validation'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient()
  const { slug: currentSlug } = await params

  try {
    await requireAdmin(supabase)
  } catch (error) {
    if (error instanceof AccessError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    throw error
  }

  // RLS and the shared guard both enforce administrator-only editing.
  const { data: existingPost } = await supabase
    .from('posts')
    .select('id')
    .eq('slug', currentSlug)
    .single()

  if (!existingPost) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求体必须是有效的 JSON' }, { status: 400 })
  }

  const parsedBody = postPayloadSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: getValidationMessage(parsedBody.error) },
      { status: 400 }
    )
  }

  const { title, slug: requestedSlug, content, excerpt, cover_image, tags, category, published } = parsedBody.data
  const newSlug = generatePostSlug(requestedSlug || title)

  if (!newSlug) {
    return NextResponse.json({ error: '标题无法生成有效链接' }, { status: 400 })
  }

  const tagSlugs = tags.map((tag) => generatePostSlug(tag))
  if (tagSlugs.some((tagSlug) => !tagSlug)) {
    return NextResponse.json({ error: '标签无法生成有效链接' }, { status: 400 })
  }

  // The RPC keeps the post row, tags, and join table atomic.
  const { data: post, error } = await supabase
    .rpc('update_post_with_tags', {
      p_current_slug: currentSlug,
      p_title: title,
      p_new_slug: newSlug,
      p_content: content,
      p_excerpt: excerpt || getPostExcerpt(content),
      p_cover_image: cover_image,
      p_tag_names: tags,
      p_tag_slugs: tagSlugs,
      p_category: category,
      p_published: published,
    })
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '标题已存在' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post })
}
