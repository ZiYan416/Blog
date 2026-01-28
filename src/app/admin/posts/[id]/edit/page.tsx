"use client"

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Editor from '@/components/editor/editor'
import { TagSelector } from '@/components/post/tag-selector'
import { PostPreviewModal } from '@/components/post/post-preview-modal'
import { ArrowLeft, Save, Send, Image as ImageIcon, Type, Loader2, Eye } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { extractTags, autoClassifyTags, generatePostSlug } from '@/lib/markdown'
import { getTagNames, ensureTagsExist } from '@/app/actions/tags'

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const fetchAvailableTags = async () => {
    setLoadingTags(true)
    try {
      const tags = await getTagNames()
      setAvailableTags(tags)
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setLoadingTags(false)
    }
  }

  useEffect(() => {
    fetchAvailableTags()
  }, [])

  useEffect(() => {
    const fetchPost = async () => {
      const supabase = createClient()
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        if (data) {
          setTitle(data.title || '')
          setSlug(data.slug || '')
          setCoverImage(data.cover_image || '')
          setContent(data.content || '')
          setIsPublished(data.published || false)
          setTags(data.tags || [])
        }
      } catch (error: any) {
        toast({
          title: "加载文章失败",
          description: error.message,
          variant: "destructive",
        })
        router.push('/post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, router, toast])

  const handleUpdate = async (published: boolean) => {
    if (!title) {
      toast({
        title: "标题不能为空",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      // 智能标签处理
      let finalTags = tags
      if (finalTags.length === 0) {
        finalTags = autoClassifyTags(content, availableTags)
        if (finalTags.length > 0) {
          toast({
            title: "已自动归类文章",
            description: `根据内容自动添加了标签: ${finalTags.join(', ')}`,
          })
        }
      }

      // 确保所有新标签都已存在于 tags 表中
      const tagsSynced = await ensureTagsExist(finalTags)
      if (!tagsSynced) {
        console.warn('部分标签同步失败，但将继续保存文章')
      }

      const postData = {
        title,
        slug: slug || generatePostSlug(title),
        content,
        cover_image: coverImage || null,
        published,
        excerpt: content.replace(/<[^>]*>/g, '').slice(0, 150) + '...',
        updated_at: new Date().toISOString(),
        tags: finalTags
      }

      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', id)

      if (error) throw error

      toast({
        title: "文章已更新",
        description: "您的修改已实时同步到云端。",
      })

      router.push('/post')
      router.refresh()
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505]">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-20">
      <div className="container max-w-6xl mx-auto px-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="rounded-full hover:bg-black/5 dark:hover:bg-white/5">
              <Link href="/post">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回列表
              </Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-black/10 dark:border-white/10"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              全屏预览
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-full border-black/10 dark:border-white/10"
              onClick={() => handleUpdate(false)}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              存为草稿
            </Button>
            <Button
              className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 px-6"
              onClick={() => handleUpdate(true)}
              disabled={saving}
            >
              <Send className="w-4 h-4 mr-2" />
              {isPublished ? '保存并更新' : '立即发布'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Editor Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="在此输入引人入胜的标题..."
                className="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-800"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <Type className="w-4 h-4" />
                  <span>链接别名:</span>
                  <input
                    type="text"
                    placeholder="文章链接别名 (如: my-first-post)"
                    className="bg-transparent border-none outline-none focus:text-black dark:focus:text-white transition-colors"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Editor
              content={content}
              onChange={setContent}
              placeholder="继续您的创作之旅..."
            />
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <TagSelector
                  value={tags}
                  onChange={setTags}
                  availableTags={availableTags}
                  loading={loadingTags}
                  onRefresh={fetchAvailableTags}
                />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  封面设置
                </h3>
                <div className="space-y-4">
                  {coverImage ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
                      <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setCoverImage('')}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 rotate-45" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl border-2 border-dashed border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-neutral-400 bg-neutral-50 dark:bg-neutral-950">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-[10px] uppercase tracking-widest font-bold">暂无图片</p>
                    </div>
                  )}
                  <Input
                    placeholder="输入封面图片 URL..."
                    className="rounded-xl border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-950"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-3xl bg-black dark:bg-white text-white dark:text-black">
              <h3 className="font-bold mb-2 text-sm">修改提示</h3>
              <ul className="text-xs space-y-2 opacity-70">
                <li>• 您正在编辑现有文章</li>
                <li>• 修改 Slug 可能会导致旧链接失效</li>
                <li>• 摘要将根据新内容自动生成</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <PostPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        post={{
          title,
          content,
          coverImage,
          tags,
          slug,
          published: isPublished,
          created_at: new Date().toISOString()
        }}
      />
    </div>
  )
}
