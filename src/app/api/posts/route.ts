import { createClient } from '@/lib/supabase/server'
import { buildPostSearchFilter, getValidationMessage, postListQuerySchema } from '@/lib/validation'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const parsedQuery = postListQuerySchema.safeParse({
    page: searchParams.get('page') || undefined,
    limit: searchParams.get('limit') || undefined,
    category: searchParams.get('category') || undefined,
    tag: searchParams.get('tag') || undefined,
    search: searchParams.get('search') || undefined,
    featured: searchParams.get('featured') || undefined,
    sort: searchParams.get('sort') || undefined,
  })

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: getValidationMessage(parsedQuery.error) },
      { status: 400 }
    )
  }

  const { page, limit, category, tag, search, featured, sort } = parsedQuery.data

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
  let postQuery = supabase.from('posts').select(selectString, { count: 'exact' })

  // Visibility is enforced by posts RLS: the public sees published posts and
  // administrators see all posts. Avoid duplicating authorization in filters.

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
    postQuery = postQuery.or(buildPostSearchFilter(search))
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
