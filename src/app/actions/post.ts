'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function incrementViewCount(slug: string) {
  const supabase = await createClient()

  // Call the RPC function to increment view count safely
  // If you don't have an RPC function, we can use a direct update
  // using rpc is better for concurrency: create function increment_view_count(post_slug text) ...

  // For now, let's try direct update which is simpler but less concurrency-safe
  // or checks if we can use a raw query.
  // Actually, Supabase typically needs an RPC for atomic increments,
  // but let's try a simple fetch-update loop for now or see if we can do rpc later.

  // Let's implement a simple RPC call assuming we will create it,
  // OR just do a quick read-update (optimistic) since high concurrency isn't expected yet.

  // Better approach for now without migration:
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
