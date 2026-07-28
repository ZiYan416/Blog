import PostList from '@/components/post/post-list';
import { getVisiblePostCards } from '@/server/repositories/posts';
import { CreatePostButton } from '@/features/posts/components/create-post-button';

export default async function PostsPage() {
  const { posts, total } = await getVisiblePostCards(9);

  return (
    <div className="container max-w-6xl mx-auto px-6 pt-8 md:pt-12 pb-12 md:pb-20">
      <PostList
        initialPosts={posts}
        initialTotal={total}
        header={
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 md:mb-4">全部文章</h1>
            <p className="text-sm md:text-base text-neutral-500">
              文字是凝固的时间。在这里，分享技术探索的足迹，也记录生活温暖的瞬间。
            </p>
          </div>
        }
        extraActions={
          <CreatePostButton />
        }
      />
    </div>
  );
}
