"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  CloudOff,
  Eye,
  Image as ImageIcon,
  Loader2,
  Save,
  Send,
  Upload,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Editor from "@/features/posts/editor/editor"
import { TagSelector } from "@/features/posts/components/tag-selector"
import { BackToTop } from "@/components/ui/back-to-top"
import { SafeImage } from "@/components/ui/safe-image"
import { useToast } from "@/hooks/use-toast"
import {
  autoClassifyTags,
  getPostExcerpt,
} from "@/lib/markdown"
import { getErrorMessage } from "@/lib/errors"
import {
  mapPostTags,
  POST_DETAIL_SELECT,
} from "@/features/posts/model"
import { usePostTags } from "@/features/posts/hooks/use-post-tags"
import { usePostCoverUpload } from "@/features/posts/hooks/use-post-cover-upload"
import {
  usePostAutosave,
  type PostAutosaveRecovery,
  type PostAutosaveStatus,
} from "@/features/posts/hooks/use-post-autosave"
import type { PostAutosaveSnapshot } from "@/features/posts/autosave-model"

const PostPreviewModal = dynamic(
  () =>
    import("@/features/posts/components/post-preview-modal").then(
      (module) => module.PostPreviewModal,
    ),
  { ssr: false },
)

function preloadPostPreview() {
  void import("@/features/posts/components/post-preview-modal")
}

interface PostFormProps {
  mode: "create" | "edit"
  postId?: string
}

const EMPTY_AUTOSAVE_SNAPSHOT: PostAutosaveSnapshot = {
  title: "",
  slug: "",
  content: "",
  coverImage: "",
  tags: [],
}

export function PostForm({ mode, postId }: PostFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = mode === "edit"
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [uploadingEditorImages, setUploadingEditorImages] = useState(false)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [originalSlug, setOriginalSlug] = useState("")
  const [articlePublicId, setArticlePublicId] = useState<number>()
  const [coverImage, setCoverImage] = useState("")
  const [content, setContent] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [basePostUpdatedAt, setBasePostUpdatedAt] = useState<string | null>(null)
  const [initialSnapshot, setInitialSnapshot] =
    useState<PostAutosaveSnapshot>(EMPTY_AUTOSAVE_SNAPSHOT)
  const [editorReady, setEditorReady] = useState(!isEditing)
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
  } = usePostCoverUpload(
    handleCoverUploaded,
    articlePublicId
  )

  const autosaveSnapshot = useMemo<PostAutosaveSnapshot>(
    () => ({ title, slug, content, coverImage, tags }),
    [content, coverImage, slug, tags, title],
  )
  const applyAutosaveSnapshot = useCallback(
    (snapshot: PostAutosaveSnapshot) => {
      setTitle(snapshot.title)
      setSlug(snapshot.slug)
      setContent(snapshot.content)
      setCoverImage(snapshot.coverImage)
      setTags(snapshot.tags)
    },
    [],
  )
  const autosave = usePostAutosave({
    enabled: editorReady,
    postId: postId || null,
    basePostUpdatedAt,
    initialSnapshot,
    snapshot: autosaveSnapshot,
    paused: saving || uploadingEditorImages || uploading,
    onRecover: applyAutosaveSnapshot,
  })

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
        const loadedSnapshot: PostAutosaveSnapshot = {
          title: post.title,
          slug: post.slug,
          content: post.content || "",
          coverImage: post.cover_image || "",
          tags: post.tags,
        }
        setArticlePublicId(post.public_id)
        setTitle(loadedSnapshot.title)
        setSlug(loadedSnapshot.slug)
        setOriginalSlug(post.slug)
        setCoverImage(loadedSnapshot.coverImage)
        setContent(loadedSnapshot.content)
        setIsPublished(post.published)
        setTags(loadedSnapshot.tags)
        setBasePostUpdatedAt(post.updated_at)
        setInitialSnapshot(loadedSnapshot)
        setEditorReady(true)
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
      if (autosave.recovery) {
        toast({
          title: "请先处理自动保存内容",
          description: "恢复或丢弃较新的草稿后，才能继续保存与发布。",
          variant: "warning",
        })
        return
      }

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
          slug: slug || null,
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

        const autosaveCleared = await autosave.clearAutosave()
        toast({
          title: published
            ? isEditing
              ? "文章已更新"
              : "发布成功"
            : "草稿已保存",
          description: autosaveCleared
            ? "文章已同步到云端。"
            : "文章已同步，但旧的自动保存副本清理失败。",
          variant: autosaveCleared ? "default" : "warning",
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
      autosave,
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
                onMouseEnter={preloadPostPreview}
                onFocus={preloadPostPreview}
              >
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">预览</span>
              </Button>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <PostSaveActions
                saving={
                  saving ||
                  uploadingEditorImages ||
                  uploading ||
                  Boolean(autosave.recovery)
                }
                published={isPublished}
                onSave={savePost}
                className="flex"
              />
              <PostAutosaveIndicator
                status={autosave.status}
                savedAt={autosave.savedAt}
              />
            </div>
          </div>
        </div>

        {autosave.recovery ? (
          <PostAutosaveRecoveryBanner
            recovery={autosave.recovery}
            onRestore={autosave.restoreRecovery}
            onDiscard={() => void autosave.discardRecovery()}
            onKeepCurrent={autosave.keepCurrentAfterConflict}
          />
        ) : null}

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
            </div>

            <Editor
              content={content}
              onChange={setContent}
              articlePublicId={articlePublicId}
              onUploadStateChange={setUploadingEditorImages}
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
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
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

      {previewOpen ? (
        <PostPreviewModal
          open
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
      ) : null}
      <BackToTop
        hideOnDesktop={false}
        positionClassName="lg:right-[24rem] xl:right-[calc((100vw-72rem)/2+23rem)]"
      />
    </div>
  )
}

function PostAutosaveIndicator({
  status,
  savedAt,
}: {
  status: PostAutosaveStatus
  savedAt: string | null
}) {
  const time = savedAt
    ? new Date(savedAt).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null
  const states: Record<
    PostAutosaveStatus,
    { label: string; icon: typeof Cloud; className: string }
  > = {
    loading: {
      label: "正在检查自动保存…",
      icon: Loader2,
      className: "animate-spin",
    },
    idle: { label: "自动保存已就绪", icon: Cloud, className: "" },
    unsaved: { label: "有未保存更改", icon: Cloud, className: "" },
    "saving-local": {
      label: "正在保存到本机…",
      icon: Loader2,
      className: "animate-spin",
    },
    "saved-local": {
      label: time ? `已于 ${time} 保存到本机` : "已保存到本机",
      icon: CheckCircle2,
      className: "",
    },
    "saving-cloud": {
      label: "正在同步云端…",
      icon: Loader2,
      className: "animate-spin",
    },
    "saved-cloud": {
      label: time ? `已于 ${time} 同步云端` : "已同步云端",
      icon: CheckCircle2,
      className: "text-emerald-600 dark:text-emerald-400",
    },
    offline: {
      label: "网络不可用，内容已保留在本机",
      icon: CloudOff,
      className: "text-amber-600 dark:text-amber-400",
    },
    conflict: {
      label: "发现需要处理的版本冲突",
      icon: AlertTriangle,
      className: "text-amber-600 dark:text-amber-400",
    },
    error: {
      label: "自动保存失败，离开前请手动保存",
      icon: AlertTriangle,
      className: "text-red-600 dark:text-red-400",
    },
  }
  const state = states[status]
  const Icon = state.icon
  const textClassName = state.className === "animate-spin" ? "" : state.className

  return (
    <div
      className={`flex items-center gap-1.5 px-1 text-xs text-neutral-500 ${textClassName}`}
      role="status"
      aria-live="polite"
    >
      <Icon className={`h-3.5 w-3.5 ${state.className}`} aria-hidden="true" />
      <span>{state.label}</span>
    </div>
  )
}

function PostAutosaveRecoveryBanner({
  recovery,
  onRestore,
  onDiscard,
  onKeepCurrent,
}: {
  recovery: PostAutosaveRecovery
  onRestore: () => void
  onDiscard: () => void
  onKeepCurrent: () => void
}) {
  const isTabConflict = recovery.conflictCode === "AUTOSAVE_CONFLICT"
  const isPostConflict = recovery.conflictCode === "POST_VERSION_CONFLICT"

  return (
    <div
      className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <div className="flex min-w-0 gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">
            {isPostConflict
              ? "文章已在其他位置更新"
              : isTabConflict
                ? "另一个标签页保存了新版本"
                : "发现比当前页面更新的自动保存内容"}
          </p>
          <p className="mt-1 text-sm opacity-80">
            {isPostConflict
              ? "请重新加载文章，基于最新线上版本继续编辑。"
              : isTabConflict
                ? "请选择载入另一标签页的版本，或保留当前内容并在下一次同步时覆盖工作副本。"
                : "自动保存内容尚未写入正式文章；恢复后可以继续编辑，丢弃则保留当前页面内容。"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {isPostConflict ? (
          <Button type="button" size="sm" onClick={() => window.location.reload()}>
            重新加载
          </Button>
        ) : isTabConflict ? (
          <>
            <Button type="button" size="sm" variant="outline" onClick={onKeepCurrent}>
              保留当前内容
            </Button>
            <Button type="button" size="sm" onClick={onRestore}>
              载入新版本
            </Button>
          </>
        ) : (
          <>
            <Button type="button" size="sm" variant="outline" onClick={onDiscard}>
              丢弃自动保存
            </Button>
            <Button type="button" size="sm" onClick={onRestore}>
              恢复内容
            </Button>
          </>
        )}
      </div>
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
