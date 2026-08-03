"use client"

import { useCallback, useRef, useState } from "react"
import { getErrorMessage } from "@/lib/errors"
import { useToast } from "@/hooks/use-toast"
import { uploadBlogImage } from "@/features/posts/image-upload"

export function usePostCoverUpload(
  onUploaded: (url: string) => void,
  articleSlug?: string,
  articleTitle?: string
) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const uploadCover = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setUploading(true)
      try {
        const url = await uploadBlogImage(file, { articleSlug, articleTitle })
        onUploaded(url)
        toast({
          title: "封面上传成功",
          description: "图片已保存到云端",
        })
      } catch (error) {
        toast({
          title: "上传失败",
          description: getErrorMessage(error, "封面上传失败"),
          variant: "destructive",
        })
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ""
      }
    },
    [articleSlug, articleTitle, onUploaded, toast]
  )

  return { inputRef, uploading, uploadCover }
}
