'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function incrementViewCount(slug: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select('view_count')
    .eq('slug', slug)
    .single()

  if (data) {
    const newCount = (data.view_count || 0) + 1
    await supabase
      .from('posts')
      .update({ view_count: newCount })
      .eq('slug', slug)

    revalidatePath(`/post/${slug}`)
  }
}

export async function toggleFeaturedStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return { error: 'Forbidden' }
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

  return { success: true }
}

export async function deletePost(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return { error: 'Forbidden' }
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

  return { success: true }
}
