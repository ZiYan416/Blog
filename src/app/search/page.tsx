import { createClient } from '@/lib/supabase/server'
import PostList from '@/components/post/post-list'
import { Metadata } from 'next'
import { Search } from 'lucide-react'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>
}): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: `搜索: ${q || '全部'} - My Blog`,
    description: `关于 "${q}" 的搜索结果`,
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>
}) {
  const { q } = await searchParams
  const query = q ? decodeURIComponent(q) : ''
  const supabase = await createClient()

  let posts = []

  if (query) {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
      .eq('published', true) // 只搜索已发布的文章
      .order('created_at', { ascending: false })
      .limit(20)

    posts = data || []
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-20">
      {/* Header */}
      <div className="bg-neutral-900 dark:bg-black text-white py-20 mb-12">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4 opacity-60">
            <Search className="w-6 h-6" />
            <span className="text-lg font-medium tracking-widest uppercase">Search Results</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold max-w-4xl truncate">
            {query ? `"${query}"` : '搜索'}
          </h1>
          <p className="mt-4 text-neutral-400">
            {query
              ? `共找到 ${posts.length} 篇相关文章`
              : '请输入关键词开始搜索'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-6">
        {query ? (
          <PostList posts={posts} />
        ) : (
          <div className="text-center py-20 text-neutral-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>请输入关键词来查找文章</p>
          </div>
        )}
      </div>
    </div>
  )
}
