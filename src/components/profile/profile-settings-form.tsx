"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, User as UserIcon, Globe, Info, Loader2, Camera, Palette, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CARD_STYLES, getCardStyle } from "@/lib/card-styles";
import { cn } from "@/lib/utils";
import { type User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileSettingsFormProps {
  user: User;
  initialProfile: {
    display_name: string;
    bio: string;
    website: string;
    avatar_url: string;
    card_bg: string;
  };
  onSaveSuccess?: () => void;
}

export function ProfileSettingsForm({ user, initialProfile, onSaveSuccess }: ProfileSettingsFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [showAllStyles, setShowAllStyles] = useState(false);

  // Get first 6 styles for default view, or all if showAllStyles is true
  // We'll calculate this dynamically in the render to keep state clean
  const stylesList = Object.entries(CARD_STYLES);
  const visibleStyles = showAllStyles ? stylesList : stylesList.slice(0, 6);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "上传失败", description: "请选择图片文件" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "上传失败", description: "图片大小不能超过 2MB" });
      return;
    }

    setUploading(true);
    try {
      if (profile.avatar_url && profile.avatar_url.includes('/avatars/')) {
        try {
          const oldPath = profile.avatar_url.split('/avatars/')[1];
          if (oldPath) {
             await supabase.storage.from('avatars').remove([oldPath]);
          }
        } catch (e) {
          console.error("Failed to delete old avatar:", e);
        }
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: "头像已更新", description: "您的新头像已成功保存。" });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "上传失败",
        description: error.message || "请检查网络或存储权限",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        website: profile.website,
        card_bg: profile.card_bg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user?.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "保存失败",
        description: error.message,
      });
    } else {
      toast({
        title: "保存成功",
        description: "您的个人资料已同步。",
      });
      router.refresh();
      if (onSaveSuccess) {
        setTimeout(() => onSaveSuccess(), 500); // Small delay for better UX
      }
    }
    setSaving(false);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Left Side: Avatar Preview */}
      <div className="md:col-span-1">
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl p-0 overflow-hidden text-center sticky top-24">
          <div className={cn("h-32 w-full relative transition-all duration-500", getCardStyle(profile.card_bg).class)}>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 group/avatar">
              <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden border-4 border-white dark:border-neutral-900">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-neutral-400" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-opacity z-10 m-1">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Camera className="w-6 h-6" />
                )}
              </label>
            </div>
          </div>

          <div className="pt-14 px-8 pb-8">
            <h3 className="font-bold text-lg mb-1 truncate">{profile.display_name || "您的名称"}</h3>
            <p className="text-xs text-neutral-500 truncate mb-6">{user?.email}</p>
            <div className="pt-6 border-t border-black/5 dark:border-white/5">
              <p className="text-xs text-neutral-400 leading-relaxed italic">
                "{profile.bio || "还没写简介..."}"
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Side: Form */}
      <div className="md:col-span-2">
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-bold">编辑资料</CardTitle>
            <CardDescription>设置您的个人资料和卡片样式。</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-black/5 dark:border-white/5">基础信息</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-neutral-500">
                    <UserIcon className="w-4 h-4" />
                    显示名称
                  </label>
                  <Input
                    value={profile.display_name}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    placeholder="例如：极简主义者"
                    className="rounded-xl border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-neutral-500">
                    <Info className="w-4 h-4" />
                    个人简介
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="简单介绍一下你自己..."
                    className="w-full min-h-[100px] p-4 rounded-xl border border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-800/50 text-sm focus:ring-1 ring-black/10 dark:ring-white/10 outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-neutral-500">
                    <Globe className="w-4 h-4" />
                    个人网站
                  </label>
                  <Input
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="rounded-xl border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-800/50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-black/5 dark:border-white/5">个性化</h3>
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2 text-neutral-500">
                    <Palette className="w-4 h-4" />
                    名片背景风格
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <AnimatePresence initial={false} mode="popLayout">
                        {visibleStyles.map(([key, style]) => (
                          <motion.div
                            key={key}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setProfile({ ...profile, card_bg: key })}
                            className={cn(
                              "cursor-pointer rounded-xl border-2 p-1 transition-all hover:scale-[1.02]",
                              profile.card_bg === key
                                ? "border-black dark:border-white bg-neutral-50 dark:bg-neutral-800"
                                : "border-transparent hover:border-black/10 dark:hover:border-white/10 bg-neutral-50/50 dark:bg-neutral-800/50"
                            )}
                          >
                            <div className={cn("h-12 w-full rounded-lg mb-2 shadow-sm", style.preview)} />
                            <p className="text-xs text-center font-medium text-neutral-600 dark:text-neutral-400">
                              {style.label}
                            </p>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>

                  {stylesList.length > 6 && (
                    <div className="flex justify-center mt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllStyles(!showAllStyles)}
                            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                        >
                            {showAllStyles ? (
                                <>
                                    <ChevronUp className="w-4 h-4 mr-1" />
                                    收起样式
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4 mr-1" />
                                    查看更多样式 ({stylesList.length - 6})
                                </>
                            )}
                        </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-8 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      保存更改
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
