import { createClient } from '@/lib/supabase/server';
import PostList from '@/components/post/post-list';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function PostsPage() {
  const supabase = await createClient();

  // 获取用户信息和管理员权限
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.is_admin || false;
  }

  // 构建查询 - 优化性能，只查询列表需要的字段
  let query = supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, published, featured, created_at, updated_at, tags, category, view_count, author_id');

  // 权限控制：
  // 1. 管理员：可以看到所有文章
  // 2. 登录用户：可以看到已发布文章 + 自己写的草稿
  // 3. 游客：只能看到已发布文章
  if (!isAdmin) {
    if (user) {
      query = query.or(`published.eq.true,author_id.eq.${user.id}`);
    } else {
      query = query.eq('published', true);
    }
  }

  const { data: posts, error } = await query.order('created_at', { ascending: false });

  return (
    <div className="container max-w-6xl mx-auto px-6 pt-8 md:pt-12 pb-12 md:pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 md:mb-4">全部文章</h1>
          <p className="text-sm md:text-base text-neutral-500">
            {isAdmin ? '欢迎回来。这里是您的数字花园，随时准备记录下新的灵感与思考。' : '文字是凝固的时间。在这里，分享技术探索的足迹，也记录生活温暖的瞬间。'}
          </p>
        </div>
        {isAdmin && (
          <Button asChild className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90">
            <Link href="/admin/posts/new">
              <Plus className="w-4 h-4 mr-2" />
              新建文章
            </Link>
          </Button>
        )}
      </div>

      <PostList
        posts={posts || []}
        error={error?.message}
      />
    </div>
  );
}
