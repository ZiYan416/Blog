import Link from "next/link";
import { Plus, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="text-xl font-bold">My Blog</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80">
              首页
            </Link>
            <Link href="/tag" className="transition-colors hover:text-foreground/80">
              标签
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground/80">
              关于
            </Link>
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login">
                <User className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/post/new">
                <Plus className="mr-2 h-4 w-4" />
                撰写文章
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">欢迎来到我的博客</h1>
            <p className="text-muted-foreground text-lg">
              这里分享技术文章、学习心得和生活感悟
            </p>
          </div>

          {/* Blog Posts Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">最新文章</h2>
              <Link href="/admin/posts" className="text-sm text-muted-foreground hover:text-foreground">
                查看全部 &rarr;
              </Link>
            </div>

            <div className="grid gap-6">
              {/* Placeholder for blog posts */}
              <div className="rounded-lg border p-6 bg-card text-center">
                <p className="text-muted-foreground">
                  暂无文章，点击右侧按钮开始撰写
                </p>
              </div>
            </div>
          </section>

          {/* Feature Section */}
          <section className="rounded-lg border bg-card p-8">
            <h2 className="text-2xl font-bold mb-4">功能特性</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">✍️</span>
                </div>
                <h3 className="font-semibold mb-2">Markdown编辑</h3>
                <p className="text-sm text-muted-foreground">
                  支持Markdown语法，轻量级编辑器，实时预览
                </p>
              </div>
              <div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold mb-2">权限管理</h3>
                <p className="text-sm text-muted-foreground">
                  区分管理员和普通用户，内容安全可控
                </p>
              </div>
              <div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="font-semibold mb-2">现代设计</h3>
                <p className="text-sm text-muted-foreground">
                  响应式布局，暗黑模式，流畅动画
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
          <p>© 2026 My Blog. Built with Next.js & Supabase</p>
        </div>
      </footer>
    </div>
  );
}
