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

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })

  // Auth/Visibility logic
  if (!isAdmin) {
    if (user) {
      // Logged in users see published posts OR their own drafts
      query = query.or(`published.eq.true,author_id.eq.${user.id}`)
    } else {
      // Anonymous users only see published posts
      query = query.eq('published', true)
    }
  }
  // If admin, no filter applied (sees everything)

  // Apply filters

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

  // Sort logic: Featured first, then by selected criteria
  // Only apply featured sorting if we're not specifically filtering for it
  if (featured !== 'true') {
    query = query.order('featured', { ascending: false })
  }

  // Secondary sort based on user selection
  switch (sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'views':
      query = query.order('view_count', { ascending: false })
      break
    case 'latest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

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
