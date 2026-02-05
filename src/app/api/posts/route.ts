import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const { data: { user } } = await supabase.auth.getUser()

  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '9')
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')
  const sort = searchParams.get('sort') || 'latest' // latest, oldest, views

  // Check if user is admin
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.is_admin || false
  }

  let query = supabase.from('posts')

  // Prepare the select statement
  // We need to determine if we are filtering by a relational tag BEFORE starting the query chain
  // or use a let variable for the query builder.

  // Tag handling logic
  let tagId: string | null = null
  if (tag) {
    const { data: tagData } = await supabase
      .from('tags')
      .select('id')
      .eq('name', tag)
      .maybeSingle()

    if (tagData) {
      tagId = tagData.id
    }
  }

  // Build the main query
  // If we have a valid tagId, we need to join with post_tags
  const selectString = tagId ? '*, post_tags!inner(tag_id)' : '*'

  // Start the query with the correct select statement
  // Note: We assign it to 'postQuery' to avoid type issues with reassigning 'query'
  let postQuery = query.select(selectString, { count: 'exact' })

  // Auth/Visibility logic
  if (!isAdmin) {
    if (user) {
      postQuery = postQuery.or(`published.eq.true,author_id.eq.${user.id}`)
    } else {
      postQuery = postQuery.eq('published', true)
    }
  }

  // Apply filters
  if (category) {
    postQuery = postQuery.eq('category', category)
  }

  if (tag) {
    if (tagId) {
      // 使用 post_tags 关联表进行精确查询
      // selectString 已经在上面设置为 '*, post_tags!inner(tag_id)'
      postQuery = postQuery.eq('post_tags.tag_id', tagId)
    } else {
      // 如果找不到 tagId (可能是旧数据)，回退到数组查询
      postQuery = postQuery.contains('tags', [tag])
    }
  }

  if (search) {
    postQuery = postQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  if (featured === 'true') {
    postQuery = postQuery.eq('featured', true)
  }

  // Sort logic
  if (featured !== 'true') {
    postQuery = postQuery.order('featured', { ascending: false })
  }

  switch (sort) {
    case 'oldest':
      postQuery = postQuery.order('created_at', { ascending: true })
      break
    case 'views':
      postQuery = postQuery.order('view_count', { ascending: false })
      break
    case 'latest':
    default:
      postQuery = postQuery.order('created_at', { ascending: false })
      break
  }

  // Pagination
  const from = (page - 1) * limit
  const to = from + limit - 1

  postQuery = postQuery.range(from, to)

  const { data, error, count } = await postQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    posts: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  })
}
