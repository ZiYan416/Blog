"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Globe, Info, Loader2, Save, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { EditableProfile } from "@/features/profile/model"
import { useProfileMediaUpload } from "@/features/profile/hooks/use-profile-media-upload"
import { ProfileAvatarCard } from "@/features/profile/components/profile-avatar-card"
import { ProfileStylePicker } from "@/features/profile/components/profile-style-picker"
import { TippingSettings } from "@/features/profile/components/tipping-settings"

interface ProfileSettingsFormProps {
  user: User
  initialProfile: EditableProfile
  onSaveSuccess?: () => void
}

export function ProfileSettingsForm({
  user,
  initialProfile,
  onSaveSuccess,
}: ProfileSettingsFormProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(initialProfile)
  const { uploading, upload } = useProfileMediaUpload(user)

  const updateProfile = (patch: Partial<EditableProfile>) => {
    setProfile((current) => ({ ...current, ...patch }))
  }

  const uploadMedia = async (
    kind: "avatar" | "alipay" | "wechat",
    file: File
  ) => {
    const previousUrl =
      kind === "avatar"
        ? profile.avatar_url
        : kind === "alipay"
          ? profile.alipay_qr
          : profile.wechat_qr
    const url = await upload(kind, file, previousUrl)
    if (!url) return

    updateProfile(
      kind === "avatar"
        ? { avatar_url: url }
        : kind === "alipay"
          ? { alipay_qr: url }
          : { wechat_qr: url }
    )
    router.refresh()
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        website: profile.website,
        card_bg: profile.card_bg,
        alipay_qr: profile.alipay_qr,
        wechat_qr: profile.wechat_qr,
        enable_tipping: profile.enable_tipping,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      toast({
        variant: "destructive",
        title: "保存失败",
        description: error.message,
      })
    } else {
      toast({ title: "保存成功", description: "您的个人资料已同步。" })
      router.refresh()
      window.setTimeout(() => onSaveSuccess?.(), 500)
    }
    setSaving(false)
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <ProfileAvatarCard
          email={user.email || ""}
          profile={profile}
          uploading={uploading}
          onAvatarUpload={(file) => void uploadMedia("avatar", file)}
          onStyleChange={(card_bg) => updateProfile({ card_bg })}
        />
      </div>

      <div className="md:col-span-2">
        <Card className="border-none shadow-sm rounded-3xl">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-bold">编辑资料</CardTitle>
            <CardDescription>设置您的个人资料和卡片样式。</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form onSubmit={handleSave} className="space-y-8">
              <section className="space-y-4" aria-labelledby="basic-profile-title">
                <h3
                  id="basic-profile-title"
                  className="text-sm font-semibold pb-2 border-b"
                >
                  基础信息
                </h3>
                <label className="space-y-2 block">
                  <span className="text-sm font-medium flex items-center gap-2 text-neutral-500">
                    <UserIcon className="w-4 h-4" aria-hidden="true" />
                    显示名称
                  </span>
                  <Input
                    value={profile.display_name}
                    onChange={(event) =>
                      updateProfile({ display_name: event.target.value })
                    }
                    placeholder="例如：极简主义者"
                    className="rounded-xl"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm font-medium flex items-center gap-2 text-neutral-500">
                    <Info className="w-4 h-4" aria-hidden="true" />
                    个人简介
                  </span>
                  <textarea
                    value={profile.bio}
                    onChange={(event) =>
                      updateProfile({ bio: event.target.value })
                    }
                    placeholder="简单介绍一下你自己..."
                    className="w-full min-h-[100px] p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 text-sm resize-none"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm font-medium flex items-center gap-2 text-neutral-500">
                    <Globe className="w-4 h-4" aria-hidden="true" />
                    个人网站
                  </span>
                  <Input
                    type="url"
                    value={profile.website}
                    onChange={(event) =>
                      updateProfile({ website: event.target.value })
                    }
                    placeholder="https://yourwebsite.com"
                    className="rounded-xl"
                  />
                </label>
              </section>

              <TippingSettings
                profile={profile}
                uploading={uploading}
                onChange={updateProfile}
                onUpload={(kind, file) => void uploadMedia(kind, file)}
              />

              <div className="md:hidden">
                <ProfileStylePicker
                  value={profile.card_bg}
                  onChange={(card_bg) => updateProfile({ card_bg })}
                  columns="grid-cols-2 sm:grid-cols-3"
                />
              </div>

              <Button
                type="submit"
                disabled={saving || uploading !== null}
                className="w-full md:w-auto px-8 rounded-full"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? "保存中..." : "保存更改"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
