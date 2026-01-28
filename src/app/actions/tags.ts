'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generatePostSlug } from '@/lib/markdown'

// Helper to check admin status
async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_admin === true
}

export async function getAllTags() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tags')
    .select('id, name, slug, post_count')
    .order('name')

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  // 兼容旧接口，如果是只需要名字的地方可能需要适配，
  // 但为了 Tag 页面，我们需要更多信息。
  // 这里的修改可能会影响到 NewPostPage/EditPostPage，我们需要检查一下。
  return data
}

// 专门为编辑器提供的简单接口
export async function getTagNames() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tags')
    .select('name')
    .order('name')

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }
  return data.map(tag => tag.name)
}

function generateSunnyColor() {
  return ''
}

export async function createTag(tagName: string) {
  // Check Admin Permission
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return { error: 'Unauthorized: Admin access required' }
  }

  const supabase = await createClient()

  let slug = generatePostSlug(tagName)

  // Handle empty slug case (e.g. purely special characters or emojis)
  if (!slug) {
    slug = `tag-${Date.now()}`
  }

  // Check if tag exists first to avoid duplicate errors if constraints are loose
  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .eq('name', tagName)
    .single()

  if (existing) return { success: true }

  // Check for slug collision
  const { data: existingSlug } = await supabase
    .from('tags')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existingSlug) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`
  }

  const { error } = await supabase
    .from('tags')
    .insert({
      name: tagName,
      slug: slug
    })

  if (error) {
    console.error('Error creating tag:', error)
    return { error: 'Failed to create tag' }
  }

  revalidatePath('/admin/posts/new')
  revalidatePath('/admin/posts/[id]/edit')
  return { success: true }
}

export async function deleteTag(id: string) {
  // Check Admin Permission
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return { error: 'Unauthorized: Admin access required' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting tag:', error)
    return { error: 'Failed to delete tag' }
  }

  revalidatePath('/tags')
  return { success: true }
}

export async function updateTag(id: string, name: string) {
  // Check Admin Permission
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return { error: 'Unauthorized: Admin access required' }
  }

  const supabase = await createClient()

  const slug = generatePostSlug(name)

  const { error } = await supabase
    .from('tags')
    .update({ name, slug })
    .eq('id', id)

  if (error) {
    console.error('Error updating tag:', error)
    return { error: 'Failed to update tag' }
  }

  revalidatePath('/tags')
  return { success: true }
}

export async function ensureTagsExist(tags: string[]) {
  // Check Admin Permission
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    // Silently fail or return false, as this is often called during post creation
    // But logically, only admins can create posts, so they should be able to create tags.
    // If a non-admin tries to create a post with new tags, this should fail.
    return false
  }

  const results = await Promise.all(tags.map(tag => createTag(tag)))
  return results.every(r => !r.error)
}
