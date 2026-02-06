"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  created_at: string;
}

interface UserDetailDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currentUserId: string;
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
  currentUserId,
}: UserDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    avatar_url: "",
    is_admin: false,
  });

  // 当对话框打开时，初始化表单数据
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && user) {
      setFormData({
        display_name: user.display_name || "",
        bio: user.bio || "",
        avatar_url: user.avatar_url || "",
        is_admin: user.is_admin,
      });
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const supabase = createClient();

      // 更新用户资料
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: formData.display_name || null,
          bio: formData.bio || null,
          avatar_url: formData.avatar_url || null,
          is_admin: formData.is_admin,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("用户信息已更新");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("更新用户失败:", error);
      toast.error("更新失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const canEditAdmin = currentUserId !== user.id;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">编辑用户资料</DialogTitle>
          <DialogDescription>
            修改用户的个人信息和权限设置
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* 用户头像预览 */}
          <div className="flex flex-col items-center gap-4 pb-4 border-b border-black/[0.03] dark:border-white/[0.03]">
            <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt={formData.display_name || user.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle className="w-12 h-12 text-neutral-400" />
              )}
            </div>
            <div className="text-center">
              <div className="font-medium">{user.email}</div>
              <div className="text-xs text-neutral-500">
                注册于 {new Date(user.created_at).toLocaleDateString("zh-CN")}
              </div>
            </div>
          </div>

          {/* 昵称 */}
          <div className="space-y-2">
            <Label htmlFor="display_name">昵称</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) =>
                setFormData({ ...formData, display_name: e.target.value })
              }
              placeholder="输入用户昵称"
              className="rounded-xl"
            />
          </div>

          {/* 个性签名 */}
          <div className="space-y-2">
            <Label htmlFor="bio">个性签名</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="输入个性签名..."
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>

          {/* 头像 URL */}
          <div className="space-y-2">
            <Label htmlFor="avatar_url">头像 URL</Label>
            <Input
              id="avatar_url"
              value={formData.avatar_url}
              onChange={(e) =>
                setFormData({ ...formData, avatar_url: e.target.value })
              }
              placeholder="https://example.com/avatar.jpg"
              className="rounded-xl"
            />
            <p className="text-xs text-neutral-500">
              输入头像图片的完整 URL 地址
            </p>
          </div>

          {/* 管理员权限 */}
          {canEditAdmin && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200/50 dark:border-purple-800/50">
              <div className="space-y-0.5">
                <Label htmlFor="is_admin" className="text-base cursor-pointer">
                  管理员权限
                </Label>
                <p className="text-xs text-neutral-500">
                  授予用户管理后台的访问权限
                </p>
              </div>
              <Switch
                id="is_admin"
                checked={formData.is_admin}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_admin: checked })
                }
              />
            </div>
          )}

          {/* 只读信息 */}
          <div className="pt-4 border-t border-black/[0.03] dark:border-white/[0.03]">
            <div className="text-xs text-neutral-500 space-y-1">
              <div className="flex justify-between">
                <span>用户 ID:</span>
                <span className="font-mono">{user.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span>注册邮箱:</span>
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-full"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full"
            >
              {loading ? "保存中..." : "保存更改"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
