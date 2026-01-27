import { createRouteHandlerClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')

  let query = supabase
    .from('posts')
    .select('*, profiles!author_id (id, email)', { count: 'exact' })
    .eq('published', true)

  // Apply filters
  if (category) {
    query = query.eq('category', category)
  }

  if (tag) {
    query = query.contains('tags', [tag])
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  if (featured === 'true') {
    query = query.eq('featured', true)
  }

  // Sort by created_at DESC
  query = query.order('created_at', { ascending: false })

  // Pagination
  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.range(from, to)

  const { data, error, count } = await query

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
