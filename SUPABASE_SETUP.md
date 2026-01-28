# Supabase 数据库设置指南 (2024 最新版)

本指南整合了项目所有的数据库结构变更，包含了最新的**多对多标签系统**和**动态配色架构**。

只需在 Supabase SQL Editor 中执行下方的 **"完整安装脚本"**，即可一次性构建出完美的数据库环境。

## 📋 快速开始

1.  进入你的 Supabase 项目 Dashboard。
2.  点击左侧菜单的 **SQL Editor**。
3.  点击 **New Query**。
4.  复制并粘贴下方的完整 SQL 脚本。
5.  点击 **Run** 执行。

---

## 🛠️ 完整安装脚本 (All-in-One)

此脚本包含：
1.  所有表结构 (`profiles`, `posts`, `tags`, `post_tags`, `comments`, `featured_posts`)
2.  安全策略 (RLS)
3.  自动化触发器 (标签计数、用户注册)
4.  存储桶配置 (Storage)

```sql
-- ==========================================
-- 1. 基础扩展与表结构 (Schema)
-- ==========================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1.1 个人资料表 (Profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 博客文章表 (Posts)
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  category TEXT,
  tags JSONB DEFAULT '[]'::jsonb, -- 前端显示缓存
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 标签表 (Tags) - 已移除 color 字段，使用前端动态配色
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 文章-标签关联表 (Post_Tags Relation) - 核心关联表
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- 1.5 评论表 (Comments)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name VARCHAR(100),
  author_email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  approved BOOLEAN DEFAULT false
);

-- 1.6 热门文章表 (Featured Posts)
CREATE TABLE IF NOT EXISTS featured_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 2. 索引优化 (Indexes)
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published, created_at DESC);

-- ==========================================
-- 3. 安全策略 (RLS Policies)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_posts ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts
CREATE POLICY "Published posts are viewable by everyone" ON posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all posts" ON posts FOR SELECT USING (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
CREATE POLICY "Admins can manage posts" ON posts FOR ALL USING (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Tags & Post_Tags
CREATE POLICY "Tags viewable by everyone" ON tags FOR SELECT USING (true);
CREATE POLICY "Post tags viewable by everyone" ON post_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON tags FOR ALL USING (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
CREATE POLICY "Admins can manage post tags" ON post_tags FOR ALL USING (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Comments
CREATE POLICY "Comments viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage comments" ON comments FOR ALL USING (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- ==========================================
-- 4. 自动化触发器 (Triggers)
-- ==========================================

-- 4.1 用户注册自动创建 Profile
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.2 标签计数自动维护 (核心逻辑)
CREATE OR REPLACE FUNCTION update_tag_counts() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    UPDATE tags SET post_count = (
      SELECT COUNT(pt.post_id) FROM post_tags pt
      JOIN posts p ON p.id = pt.post_id
      WHERE pt.tag_id = OLD.tag_id AND p.published = true
    ) WHERE id = OLD.tag_id;
  END IF;

  IF (TG_OP = 'INSERT') THEN
    UPDATE tags SET post_count = (
      SELECT COUNT(pt.post_id) FROM post_tags pt
      JOIN posts p ON p.id = pt.post_id
      WHERE pt.tag_id = NEW.tag_id AND p.published = true
    ) WHERE id = NEW.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_tags_change ON post_tags;
CREATE TRIGGER on_post_tags_change AFTER INSERT OR DELETE ON post_tags FOR EACH ROW EXECUTE FUNCTION update_tag_counts();

-- 4.3 文章发布状态变更触发重计
CREATE OR REPLACE FUNCTION update_tag_counts_on_post_change() RETURNS TRIGGER AS $$
DECLARE
  tid UUID;
BEGIN
  IF OLD.published IS DISTINCT FROM NEW.published THEN
    FOR tid IN SELECT tag_id FROM post_tags WHERE post_id = NEW.id LOOP
      UPDATE tags SET post_count = (
        SELECT COUNT(pt.post_id) FROM post_tags pt
        JOIN posts p ON p.id = pt.post_id
        WHERE pt.tag_id = tid AND p.published = true
      ) WHERE id = tid;
    END LOOP;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_publish_change_tags ON posts;
CREATE TRIGGER on_post_publish_change_tags AFTER UPDATE OF published ON posts FOR EACH ROW EXECUTE FUNCTION update_tag_counts_on_post_change();

-- ==========================================
-- 5. 存储桶配置 (Storage)
-- ==========================================

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public) VALUES
  ('blog-images', 'blog-images', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 存储权限策略
DROP POLICY IF EXISTS "Public view images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users upload images" ON storage.objects;

CREATE POLICY "Public view images" ON storage.objects FOR SELECT
USING (bucket_id IN ('blog-images', 'avatars'));

CREATE POLICY "Auth users upload images" ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('blog-images', 'avatars') AND auth.role() = 'authenticated');
```

## 👑 设置管理员权限

执行完上述脚本后，你需要手动将自己的账号设置为管理员：

```sql
-- 将 YOUR_USER_ID 替换为你的真实用户 ID (可在 Supabase Authentication 页面找到)
UPDATE profiles
SET is_admin = true
WHERE id = 'YOUR_USER_ID_HERE';
```
