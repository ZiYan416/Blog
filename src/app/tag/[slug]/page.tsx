import { createClient } from '@/lib/supabase/server'
import PostList from '@/components/post/post-list'
import { Metadata } from 'next'
import { Tag } from 'lucide-react'
import { getTagStyles } from '@/lib/tag-color'

async function getTagName(slug: string) {
  const supabase = await createClient()

  // Try to find tag by slug
  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (tag) return tag

  // Fallback: decode slug as it might be a name (legacy support)
  // Construct a fake tag object for legacy support
  const name = decodeURIComponent(slug)
  return {
    id: 'legacy',
    name: name,
    slug: slug,
    color: null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagName(slug)

  return {
    title: `#${tag.name} - 文章标签`,
    description: `查看所有关于 ${tag.name} 的文章`,
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tag = await getTagName(slug)
  const supabase = await createClient()

  // Update query to use the relationship
  // We need to query posts that have a record in post_tags matching this tag_id
  let posts: any[] = []

  if (tag.id !== 'legacy') {
    const { data } = await supabase
      .from('posts')
      .select('*, post_tags!inner(*)')
      .eq('post_tags.tag_id', tag.id)
      .eq('published', true)
      .order('created_at', { ascending: false })

    posts = data || []
  } else {
    // Legacy fallback using the contains operator on the tags array column
    const { data } = await supabase
      .from('posts')
      .select('*')
      .contains('tags', [tag.name])
      .eq('published', true)
      .order('created_at', { ascending: false })

    posts = data || []
  }

  const safePosts = posts || []
  const styles = getTagStyles(tag.name)

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-12 md:pb-20">
      {/* Header */}
      <div
        className="relative overflow-hidden py-12 md:py-20 mb-8 md:mb-12"
        style={{
          backgroundColor: styles.backgroundColor,
        }}
      >
        <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-sm" />

        <div className="container relative z-10 max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 opacity-80 text-neutral-800 dark:text-neutral-200">
            <Tag className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-base md:text-lg font-bold tracking-widest uppercase">Tag Collection</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white drop-shadow-sm">
            #{tag.name}
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-neutral-700 dark:text-neutral-300 font-medium">
            共找到 {safePosts.length} 篇相关文章
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-6">
        <PostList posts={safePosts} />
      </div>
    </div>
  )
}
