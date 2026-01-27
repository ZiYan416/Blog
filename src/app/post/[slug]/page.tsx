import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, Tag, Eye } from 'lucide-react'
import { renderMarkdown, extractTags } from '@/lib/markdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, slug')
    .eq('slug', params.slug)
    .single()

  if (!post) {
    return {
      title: '文章不存在',
    }
  }

  return {
    title: `${post.title} | My Blog`,
    description: post.title,
  }
}

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (error || !post) {
    notFound()
  }

  const content = await renderMarkdown(post.content)
  const tags = extractTags(post.content)
  const formattedDate = new Date(post.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>

        {/* Article content */}
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.view_count || 0} 次浏览
              </span>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <div className="markdown-content" dangerouslySetInnerHTML={{ __html: content }} />
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
                <Tag className="w-4 h-4 mt-0.5" />
                {tags.map((tag) => (
                  <Link key={tag} href={`/tag/${tag}`}>
                    <Button variant="outline" size="sm">
                      {tag}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Author info (placeholder) */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <h4 className="font-semibold">作者</h4>
                <p className="text-sm text-muted-foreground">{post.author_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
