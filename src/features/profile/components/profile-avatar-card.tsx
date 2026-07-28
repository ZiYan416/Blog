"use client"

import { Camera, Loader2, User as UserIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { SafeImage } from "@/components/ui/safe-image"
import { getCardStyle } from "@/lib/card-styles"
import { cn } from "@/lib/utils"
import type { EditableProfile } from "@/features/profile/model"
import type { ProfileMediaKind } from "@/features/profile/hooks/use-profile-media-upload"
import { ProfileStylePicker } from "./profile-style-picker"

export function ProfileAvatarCard({
  email,
  profile,
  uploading,
  onAvatarUpload,
  onStyleChange,
}: {
  email: string
  profile: EditableProfile
  uploading: ProfileMediaKind | null
  onAvatarUpload: (file: File) => void
  onStyleChange: (value: string) => void
}) {
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden text-center sticky top-6">
      <div
        className={cn(
          "h-32 w-full relative transition-colors",
          getCardStyle(profile.card_bg).class
        )}
      >
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 group/avatar">
          <div className="relative w-full h-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border-4 border-white dark:border-neutral-900">
            {profile.avatar_url ? (
              <SafeImage
                src={profile.avatar_url}
                alt={`${profile.display_name || "用户"}的头像`}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <UserIcon className="w-10 h-10 text-neutral-400 absolute inset-0 m-auto" />
            )}
          </div>
          <label className="absolute inset-1 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover/avatar:opacity-100 group-focus-within/avatar:opacity-100 cursor-pointer">
            <span className="sr-only">上传新头像</span>
            <input
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onAvatarUpload(file)
                event.target.value = ""
              }}
              disabled={uploading !== null}
            />
            {uploading === "avatar" ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Camera className="w-6 h-6" />
            )}
          </label>
        </div>
      </div>
      <div className="pt-14 px-8 pb-8">
        <h3 className="font-bold text-lg mb-1 truncate">
          {profile.display_name || "您的名称"}
        </h3>
        <p className="text-xs text-neutral-500 truncate mb-6">{email}</p>
        <p className="pt-6 border-t text-xs text-neutral-400 italic">
          &ldquo;{profile.bio || "还没写简介..."}&rdquo;
        </p>
      </div>
      <div className="border-t p-6 bg-neutral-50/50 dark:bg-neutral-800/10 hidden md:block">
        <ProfileStylePicker
          value={profile.card_bg}
          onChange={onStyleChange}
        />
      </div>
    </Card>
  )
}
