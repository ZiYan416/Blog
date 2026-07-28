'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { AccessError, requireAdmin } from '@/lib/server-auth'
import { invalidatePublishedPosts } from '@/server/cache'

export async function incrementViewCount(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('increment_post_view', {
    post_slug: slug,
  })

  if (error) {
    return { error: 'Failed to record view' }
  }

  return { count: typeof data === 'number' ? data : null }
}

export async function toggleFeaturedStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient()

  try {
    await requireAdmin(supabase)
  } catch (error) {
    if (error instanceof AccessError) return { error: error.message }
    throw error
  }

  const { error } = await supabase
    .from('posts')
    .update({ featured: !currentStatus })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/post')
  invalidatePublishedPosts()

  return { success: true }
}

export async function deletePost(id: string) {
  const supabase = await createClient()
  try {
    await requireAdmin(supabase)
  } catch (error) {
    if (error instanceof AccessError) return { error: error.message }
    throw error
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/post')
  invalidatePublishedPosts()

  return { success: true }
}
