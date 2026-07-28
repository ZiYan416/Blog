"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Eye,
  Image as ImageIcon,
  Loader2,
  Save,
  Send,
  Type,
  Upload,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Editor from "@/features/posts/editor/editor"
import { TagSelector } from "@/features/posts/components/tag-selector"
import { PostPreviewModal } from "@/features/posts/components/post-preview-modal"
import { BackToTop } from "@/components/ui/back-to-top"
import { SafeImage } from "@/components/ui/safe-image"
import { useToast } from "@/hooks/use-toast"
import {
  autoClassifyTags,
  generatePostSlug,
  getPostExcerpt,
} from "@/lib/markdown"
import { getErrorMessage } from "@/lib/errors"
import {
  mapPostTags,
  POST_DETAIL_SELECT,
} from "@/features/posts/model"
import { usePostTags } from "@/features/posts/hooks/use-post-tags"
import { usePostCoverUpload } from "@/features/posts/hooks/use-post-cover-upload"

interface PostFormProps {
  mode: "create" | "edit"
  postId?: string
}

export function PostForm({ mode, postId }: PostFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = mode === "edit"
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [originalSlug, setOriginalSlug] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [content, setContent] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const markdownInputRef = useRef<HTMLInputElement>(null)
  const { availableTags, loadingTags, refreshTags } = usePostTags()
  const handleCoverUploaded = useCallback((url: string) => {
    setCoverImage(url)
  }, [])
  const {
    inputRef: coverInputRef,
    uploading,
    uploadCover,
  } = usePostCoverUpload(handleCoverUploaded)

  useEffect(() => {
    if (!isEditing || !postId) return

    const loadPost = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("posts")
          .select(POST_DETAIL_SELECT)
          .eq("id", postId)
          .single()

        if (error) throw error

        const post = mapPostTags(data)
        setTitle(post.title)
        setSlug(post.slug)
        setOriginalSlug(post.slug)
        setCoverImage(post.cover_image || "")
        setContent(post.content || "")
        setIsPublished(post.published)
        setTags(post.tags)
      } catch (error) {
        toast({
          title: "加载文章失败",
          description: getErrorMessage(error, "无法加载文章"),
          variant: "destructive",
        })
        router.push("/post")
      } finally {
        setLoading(false)
      }
    }

    void loadPost()
  }, [isEditing, postId, router, toast])

  const importMarkdown = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = ({ target }) => {
      if (typeof target?.result !== "string") return
      setContent(target.result)
      if (!title) {
        const heading = target.result.match(/^#\s+(.+)$/m)
        if (heading) setTitle(heading[1].trim())
      }
    }
    reader.readAsText(file)
    if (markdownInputRef.current) markdownInputRef.current.value = ""
  }

  const savePost = useCallback(
    async (published: boolean) => {
      if (!title.trim()) {
        toast({ title: "标题不能为空", variant: "destructive" })
        return
      }

      setSaving(true)
      try {
        const finalTags =
          tags.length > 0
            ? tags
            : autoClassifyTags(content, availableTags)
        const payload = {
          title: title.trim(),
          slug: slug || generatePostSlug(title),
          content,
          cover_image: coverImage || null,
          published,
          excerpt: getPostExcerpt(content),
          tags: finalTags,
        }
        const endpoint = isEditing
          ? `/api/posts/${encodeURIComponent(originalSlug)}/update`
          : "/api/posts/create"
        const response = await fetch(endpoint, {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await response.json()

        if (!response.ok || result.error) {
          throw new Error(
            result.error || (isEditing ? "更新文章失败" : "创建文章失败")
          )
        }

        toast({
          title: published
            ? isEditing
              ? "文章已更新"
              : "发布成功"
            : "草稿已保存",
          description: "文章已同步到云端。",
        })
        router.push("/post")
        router.refresh()
      } catch (error) {
        toast({
          title: isEditing ? "更新失败" : "保存失败",
          description: getErrorMessage(error, "文章保存失败"),
          variant: "destructive",
        })
      } finally {
        setSaving(false)
      }
    },
    [
      availableTags,
      content,
      coverImage,
      isEditing,
      originalSlug,
      router,
      slug,
      tags,
      title,
      toast,
    ]
  )

  useEffect(() => {
    const publish = () => void savePost(true)
    window.addEventListener("navbar-publish", publish)
    return () => window.removeEventListener("navbar-publish", publish)
  }, [savePost])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505]">
        <Loader2
          className="w-6 h-6 animate-spin text-neutral-400"
          aria-label="正在加载文章"
        />
      </div>
    )
  }

  const suggestedTags =
    tags.length > 0 ? tags : autoClassifyTags(content, availableTags)

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-16 md:pb-20">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-12">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Button variant="ghost" asChild className="rounded-full h-9 md:h-10">
                <Link href="/post">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Link>
              </Button>
              <input
                type="file"
                ref={markdownInputRef}
                className="hidden"
                accept=".md,.markdown"
                onChange={importMarkdown}
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-dashed h-9 md:h-10"
                onClick={() => markdownInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">导入</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full h-9 md:h-10"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">预览</span>
              </Button>
            </div>

            <PostSaveActions
              saving={saving}
              published={isPublished}
              onSave={savePost}
              className="flex lg:hidden"
            />
          </div>
        </div>

        <div className="hidden lg:block fixed left-0 right-0 top-26 z-40 pointer-events-none">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 flex justify-end">
            <PostSaveActions
              saving={saving}
              published={isPublished}
              onSave={savePost}
              className="pointer-events-auto rounded-2xl bg-[#fafafa]/90 dark:bg-[#050505]/90 backdrop-blur-sm px-2 py-2 border shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 md:gap-8 items-start">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="space-y-3 md:space-y-4">
              <input
                type="text"
                aria-label="文章标题"
                placeholder="在此输入引人入胜的标题..."
                className="w-full text-2xl sm:text-3xl md:text-4xl font-bold bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-800"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500">
                <Type className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">链接别名:</span>
                <input
                  type="text"
                  aria-label="文章链接别名"
                  placeholder="my-first-post"
                  className="flex-1 bg-transparent border-none outline-none min-w-0"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                />
              </div>
            </div>

            <Editor
              content={content}
              onChange={setContent}
              placeholder={isEditing ? "继续您的创作之旅..." : "开始您的创作之旅..."}
            />
          </div>

          <div className="lg:sticky lg:top-46 space-y-4 md:space-y-6">
            <Card className="border-none shadow-sm rounded-2xl md:rounded-3xl">
              <CardContent className="p-4 md:p-6">
                <TagSelector
                  value={tags}
                  onChange={setTags}
                  availableTags={availableTags}
                  loading={loadingTags}
                  onRefresh={refreshTags}
                />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl md:rounded-3xl">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" aria-hidden="true" />
                  封面设置
                </h3>
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={coverInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={uploadCover}
                  />
                  {coverImage ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border group">
                      <SafeImage
                        src={coverImage}
                        alt="封面预览"
                        fill
                        sizes="(min-width: 1024px) 320px, 100vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => coverInputRef.current?.click()}
                        >
                          更换
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          aria-label="移除文章封面"
                          onClick={() => setCoverImage("")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      aria-label="上传文章封面"
                      onClick={() => coverInputRef.current?.click()}
                      className="w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-neutral-400 bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    >
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
                          <span className="text-[10px] uppercase tracking-widest font-bold">
                            点击上传封面
                          </span>
                        </>
                      )}
                    </button>
                  )}
                  <Input
                    aria-label="文章封面图片地址"
                    placeholder="或输入图片 URL..."
                    className="rounded-xl"
                    value={coverImage}
                    onChange={(event) => setCoverImage(event.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
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
          tags: suggestedTags,
          slug,
          published: isPublished,
          created_at: new Date().toISOString(),
        }}
      />
      <BackToTop
        hideOnDesktop={false}
        positionClassName="lg:right-[24rem] xl:right-[calc((100vw-72rem)/2+23rem)]"
      />
    </div>
  )
}

function PostSaveActions({
  saving,
  published,
  onSave,
  className,
}: {
  saving: boolean
  published: boolean
  onSave: (published: boolean) => Promise<void>
  className?: string
}) {
  return (
    <div className={`items-center gap-2 sm:gap-3 ${className || "flex"}`}>
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={() => void onSave(false)}
        disabled={saving}
      >
        <Save className="w-4 h-4 mr-2" />
        存草稿
      </Button>
      <Button
        type="button"
        className="rounded-full bg-black dark:bg-white text-white dark:text-black"
        onClick={() => void onSave(true)}
        disabled={saving}
      >
        <Send className="w-4 h-4 mr-2" />
        {published ? "更新" : "发布"}
      </Button>
    </div>
  )
}
