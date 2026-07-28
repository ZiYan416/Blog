"use client"

import { useCallback, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { createClient } from "@/lib/supabase/client"
import { getErrorMessage } from "@/lib/errors"
import { useToast } from "@/hooks/use-toast"

export function usePostCoverUpload(onUploaded: (url: string) => void) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const uploadCover = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setUploading(true)
      try {
        const extension = file.name.split(".").pop()
        const filePath = `${uuidv4()}.${extension}`
        const supabase = createClient()
        const { error } = await supabase.storage
          .from("blog-images")
          .upload(filePath, file)

        if (error) throw error

        const { data } = supabase.storage
          .from("blog-images")
          .getPublicUrl(filePath)

        onUploaded(data.publicUrl)
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
    [onUploaded, toast]
  )

  return { inputRef, uploading, uploadCover }
}
