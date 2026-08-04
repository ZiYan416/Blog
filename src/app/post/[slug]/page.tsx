import { notFound, permanentRedirect } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Tag, Eye, Clock, User } from 'lucide-react'
import { calculateReadingTime, formatDateString } from '@/lib/markdown'
import { ViewCounter } from '@/features/posts/components/view-counter'
import { CommentSection } from '@/features/posts/components/comment-section'
import { getComments } from '@/server/repositories/comments'
import { MarkdownRenderer } from '@/features/posts/components/markdown-renderer'
import { getTagStyles } from '@/lib/tag-color'
import { TableOfContents } from '@/features/posts/components/table-of-contents'
import { PostTipButton } from '@/features/posts/components/post-tip-button'
import { absoluteSiteUrl, siteConfig } from '@/lib/site-config'
import Image from 'next/image'
import { getVisiblePost } from '@/server/repositories/posts'
import { getPublicProfile } from '@/server/repositories/profiles'
import { PostPageBackground } from '@/features/posts/components/post-page-background'
import { PostListReturnButton } from '@/features/posts/components/post-list-return-button'
import { getPostPath } from '@/features/posts/post-path'
import { PostShareButton } from '@/features/posts/components/post-share-button'

import { BackToTop } from '@/components/ui/back-to-top'
import { GoToComments } from '@/components/ui/go-to-comments'
import { Suspense } from 'react'

async function PostComments({
  postId,
  commentsPromise,
}: {
  postId: string
  commentsPromise: ReturnType<typeof getComments>
}) {
  const comments = await commentsPromise
  return <CommentSection postId={postId} initialComments={comments} />
}

function PostCommentsFallback() {
  return (
    <div
      id="comments"
      aria-busy="true"
      aria-label="评论加载中"
      className="mt-8 min-h-32 border-t border-black/5 pt-8 dark:border-white/5 md:mt-16 md:pt-12"
    />
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const post = await getVisiblePost(decodedSlug)

  if (!post) {
    return {
      title: '文章不存在',
    }
  }

  return {
    title: post.title,
    description: post.excerpt || post.title,
    authors: [{ name: siteConfig.name }],
    alternates: {
      canonical: getPostPath(post.public_id),
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: getPostPath(post.public_id),
      type: 'article',
      images: post.cover_image ? [post.cover_image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const post = await getVisiblePost(decodedSlug)
  if (!post) notFound()
  if (decodedSlug !== String(post.public_id)) {
    permanentRedirect(getPostPath(post.public_id))
  }

  const commentsPromise = getComments(post.id)
  const authorPromise = post.author_id
    ? getPublicProfile(post.author_id)
    : Promise.resolve(null)
  const author = await authorPromise

  const content = post.content || ''
  const tags = post.tagLinks

  const readingTime = calculateReadingTime(content)
  const formattedDate = formatDateString(post.created_at)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.title,
    author: {
      '@type': 'Person',
      name: author?.display_name || 'Anonymous',
    },
    datePublished: post.created_at,
    image: post.cover_image || undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteSiteUrl(getPostPath(post.public_id)),
    },
  }

  const sharePostData = {
    title: post.title,
    slug: post.slug,
    public_id: post.public_id,
    excerpt: post.excerpt,
    cover_image: post.cover_image,
    created_at: post.created_at,
    tags: tags,
    author: author
      ? {
          display_name: author.display_name,
          avatar_url: author.avatar_url,
        }
      : null,
    url: absoluteSiteUrl(getPostPath(post.public_id)),
  }

  return (
    <div className="relative isolate min-h-screen bg-[#fafafa] pb-8 dark:bg-[#050505] md:pb-24">
      <ViewCounter slug={post.slug} />
      <PostPageBackground coverImage={post.cover_image} />

      {/* Hero Header */}
      <div
        data-post-hero
        className="group relative z-10 -mt-16 min-h-[360px] w-full overflow-hidden pt-16 md:min-h-[440px]"
      >
        <div className="container max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex min-h-[320px] md:min-h-[380px] items-end pt-10 pb-16 md:pt-14 md:pb-24">
            <div className="post-hero-copy w-full max-w-4xl space-y-4">
              <div className="relative z-30">
                <PostListReturnButton />
              </div>
            <h1 className="post-hero-title text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight break-words" style={{ overflowWrap: 'anywhere' }}>
              {post.title}
            </h1>

            <div className="post-hero-supporting flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm font-medium text-neutral-400">
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
              <PostShareButton post={sharePostData} />
              {!post.published && (
                <span className="bg-amber-500/80 backdrop-blur-md px-2 py-1 md:px-3 md:py-1 rounded-full border border-amber-400/50 text-white font-bold uppercase tracking-wider">
                  草稿预览
                </span>
              )}
            </div>

            {tags.length > 0 && (
              <div className="post-hero-emphasis flex flex-wrap gap-2 pt-1">
                {tags.map((tag) => {
                  const styles = getTagStyles(tag.name)
                  return (
                    <Link key={tag.slug} href={'/tag/' + tag.slug}>
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
                        <span className="text-xs font-bold uppercase tracking-wider relative z-10 shadow-sm">{tag.name}</span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-0 md:px-6 -mt-4 md:-mt-16 relative z-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main Content */}
          <div className="min-h-[50vh] rounded-none border-none bg-white/92 p-5 shadow-none backdrop-blur-2xl dark:bg-neutral-900/92 md:rounded-3xl md:border md:border-black/5 md:p-10 md:shadow-xl dark:md:border-white/5">
            {/* Mobile TOC - Card Style */}
            <div className="lg:hidden mb-8 p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-black/5 dark:border-white/5" id="mobile-toc">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                <div className="w-1 h-4 bg-amber-500 rounded-full" />
                目录
              </h3>
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <TableOfContents content={content} showTitle={false} />
              </div>
            </div>

            <MarkdownRenderer content={content} />

            {/* Mobile Author Card */}
            <div className="lg:hidden mt-8 md:mt-12 mb-0 pt-8 border-t border-dashed border-black/10 dark:border-white/10">
              <div className="bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl p-6 flex flex-col items-center text-center border border-black/5 dark:border-white/5">
                <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-neutral-700">About Author</h3>
                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4 overflow-hidden ring-4 ring-white dark:ring-neutral-900 shadow-sm">
                  {author?.avatar_url ? (
                    <Image
                      src={author.avatar_url}
                      alt={author.display_name || '作者头像'}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-lg mb-1">{author?.display_name || 'Anonymous'}</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic max-w-xs mx-auto">
                  &ldquo;{author?.bio || '暂无个人简介'}&rdquo;
                </p>
                {author?.enable_tipping && (
                  <PostTipButton 
                    alipayQr={author?.alipay_qr} 
                    wechatQr={author?.wechat_qr} 
                    authorName={author?.display_name || 'Anonymous'} 
                  />
                )}
              </div>
            </div>

            <Suspense fallback={<PostCommentsFallback />}>
              <PostComments
                postId={post.id}
                commentsPromise={commentsPromise}
              />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] flex flex-col gap-6 px-4 md:px-0">
            <div className="hidden min-h-0 flex-col overflow-hidden rounded-3xl border border-black/5 bg-white/90 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/90 lg:flex">
              <TableOfContents content={content} className="h-full p-4 pl-2 pr-2" />
            </div>

            <div className="hidden flex-none rounded-3xl border border-black/5 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/90 lg:block">
              <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-neutral-400">About Author</h3>
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4 overflow-hidden">
                  {author?.avatar_url ? (
                    <Image
                      src={author.avatar_url}
                      alt={author.display_name || '作者头像'}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-lg mb-1">{author?.display_name || 'Anonymous'}</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                  &ldquo;{author?.bio || '暂无个人简介'}&rdquo;
                </p>
                {author?.enable_tipping && (
                  <PostTipButton 
                    alipayQr={author?.alipay_qr} 
                    wechatQr={author?.wechat_qr} 
                    authorName={author?.display_name || 'Anonymous'} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <BackToTop targetId="mobile-toc" />
      <GoToComments />
      <PostShareButton
        post={sharePostData}
        variant="floating"
        className="fixed bottom-40 right-6 z-50 lg:hidden"
      />
    </div>
  )
}
