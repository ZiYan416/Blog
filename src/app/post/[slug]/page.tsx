import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, Tag, Eye, Clock, User } from 'lucide-react'
import { extractTags, calculateReadingTime, formatDateString, generatePostSlug } from '@/lib/markdown'
import { Button } from '@/components/ui/button'
import { ViewCounter } from '@/components/post/view-counter'
import { CommentSection } from '@/components/post/comment-section'
import { getComments } from '@/app/actions/comment'
import { MarkdownRenderer } from '@/components/post/markdown-renderer'
import { getTagStyles } from '@/lib/tag-color'
import { TableOfContents } from '@/components/post/table-of-contents'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, slug, excerpt')
    .eq('slug', slug)
    .single()

  if (!post) {
    return {
      title: '文章不存在',
    }
  }

  return {
    title: `${post.title} | My Blog`,
    description: post.excerpt || post.title,
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !post) {
    if (error) console.error('Supabase Error:', error)
    notFound()
  }

  // Fetch author profile - Step 2 (Separate query to avoid join errors)
  const { data: author } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', post.author_id)
    .single()

  // No longer blocking the whole page if author fetch fails (it just remains null)

  const comments = await getComments(post.id)

  const tags = post.tags || extractTags(post.content)

  const readingTime = calculateReadingTime(post.content)
  const formattedDate = formatDateString(post.created_at)

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-20">
      <ViewCounter slug={post.slug} />

      {/* Hero Header */}
      <div className="relative w-full h-[35vh] min-h-[300px] bg-neutral-900 dark:bg-black overflow-hidden">
        {post.cover_image && (
          <div className="absolute inset-0 opacity-60">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] dark:from-[#050505] via-transparent to-transparent" />
          </div>
        )}

        <div className="container max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-24 relative z-10">
          <Button variant="ghost" asChild className="absolute top-8 left-6 text-white/80 hover:text-white hover:bg-white/10 rounded-full">
            <Link href="/post">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回列表
            </Link>
          </Button>

          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-sm">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-neutral-400">
              <span className="bg-black/20 dark:bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 text-white/90">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span className="bg-black/20 dark:bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 text-white/90">
                <Clock className="w-3.5 h-3.5" />
                {readingTime}
              </span>
              <span className="bg-black/20 dark:bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 text-white/90">
                <Eye className="w-3.5 h-3.5" />
                {post.view_count || 0} 阅读
              </span>
              {!post.published && (
                <span className="bg-amber-500/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/50 text-white font-bold uppercase tracking-wider">
                  草稿预览
                </span>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => {
                  const styles = getTagStyles(tag)
                  return (
                    <Link key={tag} href={'/tag/' + generatePostSlug(tag)}>
                      <span
                        className="group relative overflow-hidden backdrop-blur-md px-3 py-1 rounded-full transition-all flex items-center gap-1.5 hover:scale-105 duration-300"
                        style={{
                          backgroundColor: styles.backgroundColor,
                          color: '#ffffff',
                          border: `1px solid ${styles.borderColor}`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
                        <Tag className="w-3 h-3 relative z-10 opacity-70" />
                        <span className="text-xs font-bold uppercase tracking-wider relative z-10 shadow-sm">{tag}</span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main Content */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-10 shadow-xl border border-black/5 dark:border-white/5">
            <MarkdownRenderer content={post.content} />

            <CommentSection postId={post.id} initialComments={comments} />
          </div>

          {/* Sidebar */}
          <div className="sticky top-24 h-[calc(100vh-8rem)] flex flex-col gap-6">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 min-h-0 flex flex-col overflow-hidden">
              <TableOfContents content={post.content} className="h-full p-4 pl-2 pr-2" />
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5 flex-none">
              <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-neutral-400">About Author</h3>
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4 overflow-hidden">
                  {author?.avatar_url ? (
                    <img src={author.avatar_url} alt={author.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-lg mb-1">{author?.display_name || 'Anonymous'}</h4>
                <p className="text-xs text-neutral-500 mb-4">{author?.email}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {author?.bio || '暂无个人简介'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
