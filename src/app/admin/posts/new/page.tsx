"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Editor from '@/components/editor/editor'
import { TagSelector } from '@/components/post/tag-selector'
import { PostPreviewModal } from '@/components/post/post-preview-modal'
import { ArrowLeft, Save, Send, Image as ImageIcon, Type, Upload, Eye, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { extractTags, autoClassifyTags, generatePostSlug } from '@/lib/markdown'
import { v4 as uuidv4 } from 'uuid'

export default function NewPostPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] flex flex-col h-screen overflow-hidden">
      <div className="container max-w-[95%] mx-auto px-6 py-4 flex-1 flex flex-col min-h-0">
        {/* Header Actions */}
        <div className="flex-none mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                <Link href="/post">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Link>
              </Button>
              {/* ... upload buttons ... */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".md,.markdown"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                className="rounded-full border-dashed border-black/20 dark:border-white/20"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                导入
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-black/10 dark:border-white/10"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                预览
              </Button>
            </div>

            <div className="flex items-center gap-3">
               {/* ... save buttons ... */}
               <Button
                variant="outline"
                className="rounded-full border-black/10 dark:border-white/10"
                onClick={() => handleSave(false)}
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                存草稿
              </Button>
              <Button
                className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 px-6"
                onClick={() => handleSave(true)}
                disabled={loading}
              >
                <Send className="w-4 h-4 mr-2" />
                发布
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 grid lg:grid-cols-4 gap-6 min-h-0">
          {/* Main Editor Area - Scrollable Column */}
          <div className="lg:col-span-3 flex flex-col h-full overflow-hidden gap-4">
            <div className="flex-none space-y-4">
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

            <div className="flex-1 min-h-0">
              <Editor
                content={content}
                onChange={setContent}
                placeholder="开始您的创作之旅..."
              />
            </div>
          </div>

          {/* Sidebar Settings - Scrollable Column */}
          <div className="h-full overflow-y-auto pr-2 pb-20 space-y-6 scrollbar-hide">
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
                  <input
                    type="file"
                    ref={coverInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleCoverUpload}
                  />

                  {coverImage ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 group">
                      <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 px-3 rounded-full text-xs"
                          onClick={() => coverInputRef.current?.click()}
                        >
                          更换
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => setCoverImage('')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      className="aspect-video rounded-2xl border-2 border-dashed border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-neutral-400 bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer group"
                    >
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 mb-2 opacity-20 group-hover:opacity-40 transition-opacity" />
                          <p className="text-[10px] uppercase tracking-widest font-bold group-hover:text-black dark:group-hover:text-white transition-colors">
                            点击上传封面
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  <Input
                    placeholder="或输入图片 URL..."
                    className="rounded-xl border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-950"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PostPreviewModal
        // ... existing props

        open={previewOpen}
        onOpenChange={setPreviewOpen}
        post={{
          title,
          content,
          coverImage,
          tags: tags.length > 0 ? tags : (autoClassifyTags(content, availableTags) || []),
          slug,
          published: false,
          created_at: new Date().toISOString()
        }}
      />
    </div>
  )
}
