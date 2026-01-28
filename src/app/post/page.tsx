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

  // 构建查询
  let query = supabase.from('posts').select('*');

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
    <div className="container max-w-6xl mx-auto px-6 pt-12 pb-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">全部文章</h1>
          <p className="text-neutral-500">
            {isAdmin ? '作为管理员，您可以查看所有文章（包括草稿）并进行管理。' : '阅读我的所有思考、技术分享与生活记录。'}
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
