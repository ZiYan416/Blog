"use client"

import { useCallback, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { getErrorMessage } from "@/lib/errors"

export type ProfileMediaKind = "avatar" | "alipay" | "wechat"

const fieldByKind = {
  avatar: "avatar_url",
  alipay: "alipay_qr",
  wechat: "wechat_qr",
} as const

export function useProfileMediaUpload(user: User) {
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()
  const [uploading, setUploading] = useState<ProfileMediaKind | null>(null)

  const upload = useCallback(
    async (
      kind: ProfileMediaKind,
      file: File,
      previousUrl?: string | null
    ): Promise<string | null> => {
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "上传失败",
          description: "请选择图片文件",
        })
        return null
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "上传失败",
          description: "图片大小不能超过 2MB",
        })
        return null
      }

      setUploading(kind)
      try {
        const extension = file.name.split(".").pop()
        const prefix = kind === "avatar" ? "avatar" : `${kind}_qr`
        const filePath = `${user.id}/${prefix}_${Date.now()}.${extension}`
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath)
        const field = fieldByKind[kind]
        const profileUpdate =
          field === "avatar_url"
            ? { avatar_url: data.publicUrl }
            : field === "alipay_qr"
              ? { alipay_qr: data.publicUrl }
              : { wechat_qr: data.publicUrl }
        const { error: updateError } = await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("id", user.id)

        if (updateError) {
          await supabase.storage.from("avatars").remove([filePath])
          throw updateError
        }

        const oldPath = previousUrl?.split("/avatars/")[1]
        if (oldPath) {
          const { error: removeError } = await supabase.storage
            .from("avatars")
            .remove([oldPath])
          if (removeError) {
            console.warn("Failed to remove replaced profile image:", removeError)
          }
        }

        toast({
          title: kind === "avatar" ? "头像已更新" : "二维码已上传",
          description: "图片已成功保存。",
        })
        return data.publicUrl
      } catch (error) {
        toast({
          variant: "destructive",
          title: "上传失败",
          description: getErrorMessage(error, "请检查网络或存储权限"),
        })
        return null
      } finally {
        setUploading(null)
      }
    },
    [supabase, toast, user.id]
  )

  return { uploading, upload }
}
