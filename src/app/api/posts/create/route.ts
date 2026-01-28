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

  // Handle tags relationship
  if (tags && Array.isArray(tags)) {
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
        const tagSlug = generatePostSlug(tagName)
        // Generate a random color for DB consistency, though UI uses client-side gen
        const hue = Math.floor(Math.random() * 360)
        const color = `hsl(${hue}, 80%, 75%)`

        const { data: newTag } = await supabase
          .from('tags')
          .insert({
            name: tagName,
            slug: tagSlug,
            color
          })
          .select('id')
          .single()
        tagId = newTag?.id
      }

      if (tagId) {
        // Insert relationship
        // Ignore duplicate key errors if any
        await supabase
          .from('post_tags')
          .upsert({
            post_id: post.id,
            tag_id: tagId
          }, { onConflict: 'post_id, tag_id' })
      }
    }
  }

  return NextResponse.json({ post })
}
