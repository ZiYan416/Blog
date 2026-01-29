"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

interface SignOutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function SignOutButton({ className, variant = "ghost" }: SignOutButtonProps) {
  const { toast } = useToast();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      toast({
        title: "正在退出...",
        description: "请稍候，正在同步您的会话状态。",
      });

      // 1. 先在客户端注销，触发 onAuthStateChange 事件以同步更新 UI (如 Navbar)
      // 使用 Promise.allSettled 确保即使客户端注销失败（如网络问题），也继续执行服务端注销
      await Promise.allSettled([supabase.auth.signOut()]);

      // 2. 调用 Server Action 彻底清除服务端 Cookies
      // 注意：actions.ts 中的 signOutAction 已移除 redirect("/login")，避免强制跳转
      await signOutAction();

      // 3. 智能重定向逻辑
      const currentPath = window.location.pathname;
      const protectedPaths = ['/admin', '/dashboard', '/profile'];

      const isProtectedPage = protectedPaths.some(path => currentPath.startsWith(path));

      if (isProtectedPage) {
        // 如果在受保护页面，重定向回首页
        window.location.href = '/';
      } else {
        // 如果在公开页面，刷新当前页以更新 UI 状态（如 Navbar 变为未登录态）
        window.location.reload();
      }
    } catch (error: any) {
      // 如果错误消息包含 NEXT_REDIRECT，说明是 Next.js 的正常跳转，不予报错
      if (error.message?.includes("NEXT_REDIRECT")) {
        return;
      }

      toast({
        variant: "destructive",
        title: "退出失败",
        description: error.message || "发生未知错误，请重试。",
      });
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      variant={variant}
      className={className}
    >
      <LogOut className="w-4 h-4 mr-2" />
      退出登录
    </Button>
  );
}
