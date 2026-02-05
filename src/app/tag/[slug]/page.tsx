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

  // 优先使用 post_tags 关联表查询
  let query = supabase.from('posts')
  let posts: any[] = []
  let count = 0

  if (tag.id !== 'legacy') {
    // 使用关联表查询
    const { data, count: total } = await query
      .select('*, post_tags!inner(tag_id)', { count: 'exact' })
      .eq('post_tags.tag_id', tag.id)
      .eq('published', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(0, 8)

    posts = data || []
    count = total || 0
  } else {
    // 降级策略：使用数组字段查询 (针对旧数据或未同步的标签)
    const { data, count: total } = await query
      .select('*', { count: 'exact' })
      .contains('tags', [tag.name])
      .eq('published', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(0, 8)

    posts = data || []
    count = total || 0
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
            共找到 {count} 篇相关文章
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-6">
        <PostList
          initialPosts={safePosts}
          initialTotal={count}
          tag={tag.name}
        />
      </div>
    </div>
  )
}
