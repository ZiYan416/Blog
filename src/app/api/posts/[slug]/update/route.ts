import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { generatePostSlug } from '@/lib/markdown'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient()
  const { slug: currentSlug } = await params

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  // Check if post exists and user is the owner
  const { data: existingPost } = await supabase
    .from('posts')
    .select('author_id, id, published')
    .eq('slug', currentSlug)
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
  const newSlug = generatePostSlug(title)

  // Check if slug is different and doesn't exist
  if (newSlug !== currentSlug) {
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', newSlug)
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
      slug: newSlug,
      content,
      excerpt: excerpt || content.slice(0, 150),
      cover_image,
      tags: tags || [],
      category,
      published: published !== undefined ? published : existingPost.published,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', currentSlug)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update tags relationship
  if (tags && Array.isArray(tags)) {
    // 1. Delete existing relationships
    await supabase
      .from('post_tags')
      .delete()
      .eq('post_id', post.id)

    // 2. Re-insert tags
    for (const tagName of tags) {
      // Check if tag exists
      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .single()

      let tagId = existingTag?.id

      if (!tagId) {
        // Create new tag
        let tagSlug = generatePostSlug(tagName)

        // Check if slug exists
        const { data: existingSlugTag } = await supabase
          .from('tags')
          .select('id')
          .eq('slug', tagSlug)
          .maybeSingle()

        if (existingSlugTag) {
          // Slug collision! Append a random suffix
          tagSlug = `${tagSlug}-${Math.floor(Math.random() * 1000)}`
        }

        const { data: newTag, error: createError } = await supabase
          .from('tags')
          .insert({
            name: tagName,
            slug: tagSlug
          })
          .select('id')
          .single()

        if (createError) {
           console.error("Failed to create tag:", tagName, createError)
           // Try one last time to find it (race condition?)
           const { data: retryTag } = await supabase
             .from('tags')
             .select('id')
             .eq('name', tagName)
             .maybeSingle()
           tagId = retryTag?.id
        } else {
           tagId = newTag?.id
        }
      }

      if (tagId) {
        console.log(`[UPDATE] Inserting post_tags: post_id=${post.id}, tag_id=${tagId}, tag_name=${tagName}`)
        const { error: insertError } = await supabase
          .from('post_tags')
          .insert({
            post_id: post.id,
            tag_id: tagId
          })

        if (insertError) {
          console.error(`[UPDATE] Failed to insert post_tags for tag "${tagName}":`, insertError)
        } else {
          console.log(`[UPDATE] Successfully inserted post_tags for tag "${tagName}"`)
        }
      } else {
        console.warn(`[UPDATE] Skipping tag "${tagName}" - no tagId available`)
      }
    }
  }

  return NextResponse.json({ post })
}
