"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, User as UserIcon, Globe, Info, Loader2, Camera } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, profile: cachedProfile, loading: authLoading } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    website: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    // 优先使用缓存
    if (cachedProfile) {
      setProfile({
        display_name: cachedProfile.display_name || "",
        bio: cachedProfile.bio || "",
        website: cachedProfile.website || "",
        avatar_url: cachedProfile.avatar_url || "",
      });
      setLoading(false);
    }

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user?.id)
          .single();

        if (data) {
          setProfile({
            display_name: data.display_name || "",
            bio: data.bio || "",
            website: data.website || "",
            avatar_url: data.avatar_url || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, authLoading, router, cachedProfile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // 校验文件类型和大小
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
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // 1. 上传图片
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. 获取公开链接
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. 更新数据库
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
    }
    setSaving(false);
  };

  if (authLoading || (loading && !profile.display_name)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505]">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-20">
      <div className="container max-w-4xl mx-auto px-6 pt-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          返回仪表盘
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Side: Avatar Preview */}
          <div className="md:col-span-1">
            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl p-8 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6 group/avatar">
                <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden border border-black/5 dark:border-white/5">
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
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-opacity">
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
              <h3 className="font-bold text-lg mb-1 truncate">{profile.display_name || "您的名称"}</h3>
              <p className="text-xs text-neutral-500 truncate mb-6">{user?.email}</p>
              <div className="pt-6 border-t border-black/5 dark:border-white/5">
                <p className="text-xs text-neutral-400 leading-relaxed italic">
                  "{profile.bio || "还没写简介..."}"
                </p>
              </div>
            </Card>
          </div>

          {/* Right Side: Form */}
          <div className="md:col-span-2">
            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-3xl">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-bold">编辑资料</CardTitle>
                <CardDescription>设置您的公开博主身份信息。</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-neutral-400" />
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
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Info className="w-4 h-4 text-neutral-400" />
                      个人简介
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="简单介绍一下你自己..."
                      className="w-full min-h-[120px] p-4 rounded-xl border border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-800/50 text-sm focus:ring-1 ring-black/10 dark:ring-white/10 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4 text-neutral-400" />
                      个人网站
                    </label>
                    <Input
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                      className="rounded-xl border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-800/50"
                    />
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
      </div>
    </div>
  );
}
