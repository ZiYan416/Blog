"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, User, Search, Settings, LayoutDashboard, FileText } from "lucide-react";
import { type User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useUser } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LoginModal } from "@/components/auth/login-modal";
import { Logo } from "@/components/ui/logo";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/post", label: "文章" },
  { href: "/tag", label: "标签" },
  { href: "/about", label: "关于" },
];

export function Navbar({ user: initialUser }: { user?: SupabaseUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { user: clientUser, isAdmin } = useUser();

  const user = clientUser || initialUser;


  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/70 backdrop-blur-xl">
      <div className="container max-w-6xl mx-auto h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="group-hover:scale-105 transition-transform duration-300" />
            <span className="text-xl font-bold tracking-tight font-serif italic">Blog</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-all",
                  pathname === item.href
                    ? "bg-black/5 dark:bg-white/5 text-black dark:text-white"
                    : "text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center mr-2 relative">
            <Search className="absolute left-3 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="pl-9 pr-4 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-900 border-none rounded-full w-32 focus:w-48 transition-all outline-none focus:ring-1 ring-black/10 dark:ring-white/10"
            />
          </div>

          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5 text-black dark:text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>我的账号</DropdownMenuLabel>
                <div className="px-3 py-1.5 text-xs text-neutral-500 truncate">
                  {user.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center w-full">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    个人中心
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/posts/new" className="flex items-center w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        写文章
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/post" className="flex items-center w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        管理文章
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    账号设置
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <SignOutButton
                    variant="ghost"
                    className="w-full justify-start h-9 px-2 py-1.5 text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20 border-none rounded-sm"
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginModal>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </LoginModal>
          )}

          {user && (
            <Button asChild className="hidden sm:flex rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity px-6">
              <Link href="/admin/posts/new">
                <Plus className="w-4 h-4 mr-1.5" />
                发布
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
