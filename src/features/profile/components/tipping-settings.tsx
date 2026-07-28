"use client"

import { Camera, Loader2, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { SafeImage } from "@/components/ui/safe-image"
import type { EditableProfile } from "@/features/profile/model"
import type { ProfileMediaKind } from "@/features/profile/hooks/use-profile-media-upload"

export function TippingSettings({
  profile,
  uploading,
  onChange,
  onUpload,
}: {
  profile: EditableProfile
  uploading: ProfileMediaKind | null
  onChange: (patch: Partial<EditableProfile>) => void
  onUpload: (kind: "alipay" | "wechat", file: File) => void
}) {
  return (
    <section className="pt-2" aria-labelledby="tipping-settings-title">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b">
        <h3 id="tipping-settings-title" className="text-sm font-semibold">
          打赏设置（赞赏码）
        </h3>
        <label className="flex items-center gap-2 text-sm text-neutral-500">
          启用打赏展示
          <Switch
            checked={profile.enable_tipping}
            onCheckedChange={(checked) =>
              onChange({ enable_tipping: checked })
            }
            aria-label="启用打赏展示"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <QrField
          kind="alipay"
          label="支付宝赞赏码"
          value={profile.alipay_qr}
          uploading={uploading}
          onChange={(value) => onChange({ alipay_qr: value })}
          onUpload={onUpload}
        />
        <QrField
          kind="wechat"
          label="微信赞赏码"
          value={profile.wechat_qr}
          uploading={uploading}
          onChange={(value) => onChange({ wechat_qr: value })}
          onUpload={onUpload}
        />
      </div>
    </section>
  )
}

function QrField({
  kind,
  label,
  value,
  uploading,
  onChange,
  onUpload,
}: {
  kind: "alipay" | "wechat"
  label: string
  value: string
  uploading: ProfileMediaKind | null
  onChange: (value: string) => void
  onUpload: (kind: "alipay" | "wechat", file: File) => void
}) {
  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-neutral-500">{label}</span>
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden border relative group/qr">
          {value ? (
            <SafeImage
              src={value}
              alt={label}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <Camera className="w-6 h-6 text-neutral-400 absolute inset-0 m-auto" />
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover/qr:opacity-100 group-focus-within/qr:opacity-100 cursor-pointer">
            <span className="sr-only">上传{label}</span>
            <input
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading !== null}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onUpload(kind, file)
                event.target.value = ""
              }}
            />
            {uploading === kind ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </label>
        </div>
        <Input
          aria-label={`${label}图片地址`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="或填入图片链接..."
          className="rounded-xl text-xs"
        />
      </div>
    </div>
  )
}
