-- 全新整合的数据库 Schema (Consolidated Schema)
-- 包含：Posts, Tags, Profiles, M2M Relations, RLS Policies, Triggers

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (User Data)
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

-- 3. Posts Table
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
  tags JSONB DEFAULT '[]'::jsonb, -- 仅用于前端快速展示 (Display Cache)
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tags Table (Clean, no color)
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Post_Tags Relation (Many-to-Many, Source of Truth)
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- 6. RLS Policies (Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, User edit own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: Public read published, Admin read all/write
CREATE POLICY "Published posts are viewable by everyone" ON posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all posts" ON posts FOR SELECT USING (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
CREATE POLICY "Admins can insert posts" ON posts FOR INSERT WITH CHECK (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
CREATE POLICY "Admins can update posts" ON posts FOR UPDATE USING (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
CREATE POLICY "Admins can delete posts" ON posts FOR DELETE USING (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Tags: Public read, Admin write
CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);
CREATE POLICY "Admins can insert tags" ON tags FOR INSERT WITH CHECK (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
CREATE POLICY "Admins can update tags" ON tags FOR UPDATE USING (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
CREATE POLICY "Admins can delete tags" ON tags FOR DELETE USING (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Post_Tags: Same as Tags
CREATE POLICY "Post tags viewable by everyone" ON post_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage post tags" ON post_tags FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- 7. Triggers for Profile Handling
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Triggers for Tag Counts (The Robust Logic)
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
CREATE TRIGGER on_post_tags_change
AFTER INSERT OR DELETE ON post_tags
FOR EACH ROW EXECUTE FUNCTION update_tag_counts();

-- 9. Trigger for Post Publish Status Change
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
CREATE TRIGGER on_post_publish_change_tags
AFTER UPDATE OF published ON posts
FOR EACH ROW EXECUTE FUNCTION update_tag_counts_on_post_change();
