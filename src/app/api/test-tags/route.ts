import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const diagnostics = {
    timestamp: new Date().toISOString(),
    checks: [] as any[]
  }

  // Check 1: Current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  diagnostics.checks.push({
    name: 'Authentication',
    user: user ? { id: user.id, email: user.email } : null,
    error: authError?.message
  })

  if (!user) {
    return NextResponse.json(diagnostics)
  }

  // Check 2: Is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  diagnostics.checks.push({
    name: 'Admin Status',
    isAdmin: profile?.is_admin || false
  })

  // Check 3: Can read tags
  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('*')
    .limit(5)

  diagnostics.checks.push({
    name: 'Read Tags Table',
    success: !tagsError,
    count: tags?.length || 0,
    error: tagsError?.message,
    sample: tags?.[0]
  })

  // Check 4: Can read post_tags
  const { data: postTags, error: postTagsError } = await supabase
    .from('post_tags')
    .select('*')
    .limit(5)

  diagnostics.checks.push({
    name: 'Read post_tags Table',
    success: !postTagsError,
    count: postTags?.length || 0,
    error: postTagsError?.message,
    sample: postTags?.[0]
  })

  // Check 5: Try to insert a test tag (we'll delete it right after)
  const testTagName = `test-${Date.now()}`
  const { data: testTag, error: insertTagError } = await supabase
    .from('tags')
    .insert({
      name: testTagName,
      slug: testTagName
    })
    .select('id')
    .single()

  diagnostics.checks.push({
    name: 'Insert Tag Permission',
    success: !insertTagError,
    error: insertTagError?.message,
    tagId: testTag?.id
  })

  // Check 6: Try to insert into post_tags (if we have a test post)
  if (testTag?.id) {
    const { data: anyPost } = await supabase
      .from('posts')
      .select('id')
      .limit(1)
      .single()

    if (anyPost) {
      const { error: insertPostTagError } = await supabase
        .from('post_tags')
        .insert({
          post_id: anyPost.id,
          tag_id: testTag.id
        })

      diagnostics.checks.push({
        name: 'Insert post_tags Permission',
        success: !insertPostTagError,
        error: insertPostTagError?.message
      })

      // Cleanup
      await supabase.from('post_tags').delete().eq('tag_id', testTag.id)
    }

    // Delete test tag
    await supabase.from('tags').delete().eq('id', testTag.id)
  }

  return NextResponse.json(diagnostics, { status: 200 })
}
