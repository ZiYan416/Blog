"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";

export function ResetPasswordClient() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("新密码至少需要 8 个字符");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: "密码已更新",
        description: "请使用新密码继续访问您的账号。",
      });

      router.replace("/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "密码更新失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-black/5">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo className="w-12 h-12 text-2xl mb-4" />
          <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">设置新密码</h1>
          <p className="text-sm text-neutral-500 mt-2">
            请输入一个新的安全密码，更新后会保持当前登录状态。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm p-3 rounded-xl text-center font-medium text-red-500 bg-red-50 dark:bg-red-950/30">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-semibold text-neutral-500 ml-1">
              新密码
            </Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="至少 8 个字符"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-semibold text-neutral-500 ml-1">
              确认新密码
            </Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="再次输入新密码"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              className="h-11 rounded-xl"
            />
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading} aria-busy={loading}>
            {loading ? "更新中..." : "更新密码"}
          </Button>
        </form>
      </div>
    </div>
  );
}
