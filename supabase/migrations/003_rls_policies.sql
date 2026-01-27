-- ============================================
-- profiles 表（用于存储管理员信息）
-- ============================================

-- 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 启用 profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 允许用户查看自己的 profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- ============================================
-- posts 表策略
-- ============================================

-- 启用 RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看已发布的文章
CREATE POLICY "Public posts are viewable by everyone"
  ON posts FOR SELECT
  USING (published = true);

-- 允许已登录用户插入文章
CREATE POLICY "Posts can be inserted by authenticated users"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 允许作者更新自己的文章
CREATE POLICY "Posts can be updated by owner"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

-- 允许作者删除自己的文章
CREATE POLICY "Posts can be deleted by owner"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- tags 表策略
-- ============================================

-- 启用 RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看标签
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

-- ============================================
-- featured_posts 表策略
-- ============================================

-- 启用 RLS
ALTER TABLE featured_posts ENABLE ROW LEVEL SECURITY;

-- 允许管理员管理热门文章
CREATE POLICY "Featured posts can be managed by admin"
  ON featured_posts FOR ALL
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- ============================================
-- comments 表策略
-- ============================================

-- 启用 RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 允许查看已批准的评论
CREATE POLICY "Comments can be viewed by everyone if approved"
  ON comments FOR SELECT
  USING (approved = true);

-- 允许已登录用户插入评论
CREATE POLICY "Comments can be inserted by authenticated users"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 允许作者删除自己的评论
CREATE POLICY "Comments can be deleted by owner"
  ON comments FOR DELETE
  USING (auth.uid() = (SELECT author_id FROM posts WHERE id = post_id));

-- ============================================
-- 存储桶策略（用于图片上传）
-- ============================================

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public) VALUES
  ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- 允许已登录用户上传图片
CREATE POLICY "Images can be uploaded by authenticated users"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);

-- 允许所有人下载图片
CREATE POLICY "Images can be downloaded by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- 允许作者删除自己的图片
CREATE POLICY "Images can be deleted by owner"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);
