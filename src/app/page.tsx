import Link from "next/link";
import { ArrowRight, Sparkles, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getTagStyles } from "@/lib/tag-color";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch featured posts (published = true AND featured = true)
  const { data: featuredPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-xs font-medium text-neutral-500">探索技术与创作的边界</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          记录思想，<br />
          <span className="text-neutral-400 dark:text-neutral-600">分享技术的纯粹。</span>
        </h1>

        <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          一个专注于内容与阅读体验的现代博客平台。支持 Markdown 写作，让您的每一篇文字都呈现出它应有的质感。
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <Button asChild size="lg" className="rounded-full px-8 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity">
            <Link href="/post">
              开始阅读
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Link href="/about">了解更多</Link>
          </Button>
        </div>
      </section>

      {/* Featured Posts Preview */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-12 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">精选文章</h2>
          <Link href="/post" className="text-sm font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
            查看全部 →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {featuredPosts && featuredPosts.length > 0 ? (
            featuredPosts.map((post) => {
              // Try to find a primary tag to display
              let primaryTag = "Featured";
              if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
                 primaryTag = post.tags[0];
              }

              const styles = getTagStyles(primaryTag);

              return (
              <Link
                key={post.id}
                href={`/post/${post.slug}`}
                className="group relative block p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-black/[0.03] dark:border-white/[0.03] hover:border-black/10 dark:hover:border-white/10 transition-all duration-500"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                      style={{
                        backgroundColor: styles.backgroundColor,
                        color: '#333',
                        border: `1px solid ${styles.borderColor}`
                      }}
                    >
                      <Tag className="w-3 h-3 opacity-60" />
                      {primaryTag}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:translate-x-1 transition-transform duration-500 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-8 line-clamp-2">
                    {post.excerpt || "暂无摘要..."}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-black/[0.03] dark:border-white/[0.03]">
                    <span className="text-xs font-medium text-neutral-400">
                      {post.view_count || 0} views
                    </span>
                    <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all duration-500">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            )})
          ) : (
            <div className="col-span-2 p-12 text-center rounded-3xl border-2 border-dashed border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-900/50">
               <div className="flex flex-col items-center gap-4 text-neutral-400">
                 <FileText className="w-10 h-10 opacity-20" />
                 <p>暂无精选文章</p>
                 <Button asChild variant="outline" className="rounded-full mt-2">
                   <Link href="/admin/posts/new">发布第一篇文章</Link>
                 </Button>
               </div>
            </div>
          )}
        </div>
      </section>

      {/* Modern Features Grid */}
      <section className="w-full bg-black/[0.02] dark:bg-white/[0.02] py-24">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
              <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                <div className="w-2 h-2 bg-white dark:bg-black rounded-full" />
              </div>
              <h4 className="font-semibold mb-3">极致阅读</h4>
              <p className="text-sm text-neutral-500 leading-relaxed">
                精心调优的排版系统，让长篇阅读不再疲惫。
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                <div className="w-4 h-1 bg-black dark:bg-white rounded-full" />
              </div>
              <h4 className="font-semibold mb-3">Markdown 原生</h4>
              <p className="text-sm text-neutral-500 leading-relaxed">
                全功能的 Markdown 支持，让写作回归表达本身。
              </p>
            </div>
            <div>
              <div className="w-10 h-10 border border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                <div className="w-3 h-3 border-2 border-black dark:border-white rounded-sm" />
              </div>
              <h4 className="font-semibold mb-3">暗黑模式</h4>
              <p className="text-sm text-neutral-500 leading-relaxed">
                完美适配系统的深浅色模式，保护您的视力。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
