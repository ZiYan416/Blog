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

import { BackToTop } from '@/components/ui/back-to-top'

// Force dynamic rendering since we use searchParams or cookies implicitly via headers in layout
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, slug, excerpt')
    .eq('slug', decodedSlug)
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
  const decodedSlug = decodeURIComponent(slug)
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', decodedSlug)
    .single()

  if (error || !post) {
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase Error:', error)
    }
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

  // 获取当前登录用户用于评论区预填充
  const { data: { user } } = await supabase.auth.getUser()
  let currentUser = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    currentUser = {
      id: user.id,
      name: profile?.display_name || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      avatar_url: profile?.avatar_url,
      card_bg: profile?.card_bg || 'default'
    }
  }

  const tags = post.tags || extractTags(post.content)

  const readingTime = calculateReadingTime(post.content)
  const formattedDate = formatDateString(post.created_at)

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-8 md:pb-24">
      <ViewCounter slug={post.slug} />

      {/* Hero Header */}
      <div className="relative w-full h-[35vh] min-h-[300px] md:h-[40vh] md:min-h-[350px] bg-neutral-900 dark:bg-black overflow-hidden group">
        {post.cover_image && (
          <div className="absolute inset-0 opacity-60">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] dark:from-[#050505] via-transparent to-transparent" />
          </div>
        )}

        <div className="container max-w-6xl mx-auto px-6 h-full flex flex-col justify-end md:justify-start md: pb-12 pt-12 relative z-10">
          <div className="space-y-4 pt-16 md:pt-0">
            <div className="absolute top-4 left-6 md:static z-30">
              <Button variant="ghost" asChild className="text-white hover:text-white hover:bg-white/20 rounded-full h-10 w-auto px-4 gap-2 bg-black/50 backdrop-blur-md md:bg-transparent md:backdrop-blur-none">
                <Link href="/post">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">返回列表</span>
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-sm">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm font-medium text-neutral-400">
              <span className="bg-black/20 dark:bg-white/10 backdrop-blur-md px-2 py-1 md:px-3 md:py-1 rounded-full border border-white/10 flex items-center gap-2 text-white/90">
                <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {formattedDate}
              </span>
              <span className="bg-black/20 dark:bg-white/10 backdrop-blur-md px-2 py-1 md:px-3 md:py-1 rounded-full border border-white/10 flex items-center gap-2 text-white/90">
                <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {readingTime}
              </span>
              <span className="bg-black/20 dark:bg-white/10 backdrop-blur-md px-2 py-1 md:px-3 md:py-1 rounded-full border border-white/10 flex items-center gap-2 text-white/90">
                <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {post.view_count || 0} 阅读
              </span>
              {!post.published && (
                <span className="bg-amber-500/80 backdrop-blur-md px-2 py-1 md:px-3 md:py-1 rounded-full border border-amber-400/50 text-white font-bold uppercase tracking-wider">
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

      <div className="container max-w-6xl mx-auto px-0 md:px-6 -mt-4 md:-mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main Content */}
          <div className="bg-white dark:bg-neutral-900 rounded-none md:rounded-3xl p-5 md:p-10 shadow-none md:shadow-xl border-none md:border border-black/5 dark:border-white/5 min-h-[50vh]">
            {/* Mobile TOC - Card Style */}
            <div className="lg:hidden mb-8 p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-black/5 dark:border-white/5" id="mobile-toc">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                <div className="w-1 h-4 bg-amber-500 rounded-full"/>
                目录
              </h3>
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <TableOfContents content={post.content} showTitle={false} />
              </div>
            </div>

            <MarkdownRenderer content={post.content} />

             {/* Mobile Author Card */}
            <div className="lg:hidden mt-8 md:mt-12 mb-0 pt-8 border-t border-dashed border-black/10 dark:border-white/10">
              <div className="bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl p-6 flex flex-col items-center text-center border border-black/5 dark:border-white/5">
                <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-neutral-700">About Author</h3>
                 <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4 overflow-hidden ring-4 ring-white dark:ring-neutral-900 shadow-sm">
                  {author?.avatar_url ? (
                    <img src={author.avatar_url} alt={author.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-lg mb-1">{author?.display_name || 'Anonymous'}</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 font-medium">{author?.email}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic max-w-xs mx-auto">
                  "{author?.bio || '暂无个人简介'}"
                </p>
              </div>
            </div>

            <CommentSection
              postId={post.id}
              initialComments={comments}
              currentUser={currentUser}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] flex flex-col gap-6 px-4 md:px-0">
            <div className="hidden lg:flex bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 min-h-0 flex-col overflow-hidden">
              <TableOfContents content={post.content} className="h-full p-4 pl-2 pr-2" />
            </div>

            <div className="hidden lg:block bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5 flex-none">
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
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                  "{author?.bio || '暂无个人简介'}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BackToTop targetId="mobile-toc" />
    </div>
  )
}
