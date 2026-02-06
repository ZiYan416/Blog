"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, User, Search, Settings, LayoutDashboard, FileText, Menu, ChevronUp, ChevronDown } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const { user: clientUser, profile, isAdmin } = useUser();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  const user = clientUser || initialUser;
  // 优先使用 profile 中的头像 (用户上传的)，其次是 user_metadata (第三方登录的)，最后是 placeholder
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };


  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out overflow-hidden",
        isNavbarVisible
          ? "h-16 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/70 backdrop-blur-xl"
          : "h-0 border-none bg-transparent"
      )}>
        <div className={cn(
          "container max-w-6xl mx-auto h-16 flex items-center justify-between px-6 transition-all duration-300 ease-in-out",
          !isNavbarVisible && "-translate-y-full opacity-0"
        )}>
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile Menu */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-neutral-500 hover:text-black dark:hover:text-white" suppressHydrationWarning>
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SheetHeader className="p-6 pb-2 text-left">
                <SheetTitle className="flex items-center gap-3">
                  <Logo className="w-8 h-8" />
                  <span className="text-lg font-bold tracking-tight font-serif italic">Blog</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 p-6 pt-2">

                {/* Mobile Nav Links */}
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        "px-4 py-3 text-sm font-medium rounded-xl transition-all flex items-center gap-3",
                        pathname === item.href
                          ? "bg-black/5 dark:bg-white/5 text-black dark:text-white"
                          : "text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-4 border-t border-black/5 dark:border-white/5 pt-6">
                  {user ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4 px-2 text-left">
                        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden border border-black/5 dark:border-white/5">
                           {avatarUrl ? (
                             <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                           ) : (
                             <User className="w-5 h-5 text-neutral-500" />
                           )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                           <span className="text-sm font-bold truncate">{profile?.display_name || user.email?.split('@')[0]}</span>
                           <span className="text-xs text-neutral-500 truncate">{user.email}</span>
                        </div>
                      </div>

                      <nav className="flex flex-col gap-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsSheetOpen(false)}
                          className="px-4 py-3 text-sm font-medium text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all flex items-center gap-3"
                        >
                           <LayoutDashboard className="w-4 h-4" />
                           个人中心
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              href="/admin/posts/new"
                              onClick={() => setIsSheetOpen(false)}
                              className="px-4 py-3 text-sm font-medium text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all flex items-center gap-3"
                            >
                               <Plus className="w-4 h-4" />
                               写文章
                            </Link>
                            <Link
                              href="/post"
                              onClick={() => setIsSheetOpen(false)}
                              className="px-4 py-3 text-sm font-medium text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all flex items-center gap-3"
                            >
                               <FileText className="w-4 h-4" />
                               管理文章
                            </Link>
                          </>
                        )}
                        <Link
                          href="/profile"
                          onClick={() => setIsSheetOpen(false)}
                          className="px-4 py-3 text-sm font-medium text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all flex items-center gap-3"
                        >
                           <Settings className="w-4 h-4" />
                           账号设置
                        </Link>
                      </nav>

                      <div className="px-2">
                        <SignOutButton
                          variant="outline"
                          className="w-full justify-center border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/30"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="px-2">
                       <LoginModal>
                         <Button className="w-full rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90">
                           登录 / 注册
                         </Button>
                       </LoginModal>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="hidden md:flex items-center gap-3 group">
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

        <div className="flex items-center gap-3 pr-8 md:pr-0">
          <form onSubmit={handleSearch} className="flex items-center mr-2 relative">
            <Search className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="search"
              enterKeyHint="search"
              placeholder="搜索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-900 border-none rounded-full w-32 focus:w-48 transition-all outline-none focus:ring-1 ring-black/10 dark:ring-white/10 appearance-none"
            />
          </form>

          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex rounded-full w-11 h-11" suppressHydrationWarning>
                   <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden border border-black/5 dark:border-white/5">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-black dark:text-white" />
                      )}
                   </div>
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
              <Button variant="ghost" size="icon" className="hidden md:flex rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </LoginModal>
          )}

          {isAdmin && (
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

      {/* Mobile Navbar Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 right-2 z-[60] md:hidden rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
        onClick={() => setIsNavbarVisible(!isNavbarVisible)}
      >
        {isNavbarVisible ? (
          <ChevronUp className="w-5 h-5 text-neutral-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-500" />
        )}
      </Button>

      {/* Spacer to prevent content overlap, animates with navbar visibility */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isNavbarVisible ? "h-16" : "h-0"
      )} />
    </>
  );
}
