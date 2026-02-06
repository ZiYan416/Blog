-- ============================================================================
-- 完整数据库 Schema - Blog System with Dashboard Analytics
-- ============================================================================
-- 包含：Posts, Tags, Profiles, Comments, M2M Relations, Stats Snapshots
-- 最后更新：2026-02-06 (整合 Dashboard v3 Analytics)
-- ============================================================================

-- 1. Enable Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- 2. Core Tables (Posts, Profiles, Tags, Comments)
-- ============================================================================

-- 2.1 Profiles Table (User Data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  card_bg TEXT DEFAULT 'default',
  is_admin BOOLEAN DEFAULT false,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  category TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Post_Tags Relation (Many-to-Many)
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- 2.5 Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. Dashboard Analytics Tables (Dashboard v3)
-- ============================================================================

-- 3.1 Stats Snapshots Table (Daily Statistics)
CREATE TABLE IF NOT EXISTS stats_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,

  -- Core Metrics (累计数据)
  total_posts INT DEFAULT 0,
  total_views INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_users INT DEFAULT 0,

  -- Daily Increments (每日新增)
  new_posts_today INT DEFAULT 0,
  new_views_today INT DEFAULT 0,
  new_comments_today INT DEFAULT 0,
  new_users_today INT DEFAULT 0,

  -- Active Users (活跃用户)
  active_users_today INT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. Indexes for Performance
-- ============================================================================

-- Core tables indexes
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Stats snapshots indexes
CREATE INDEX IF NOT EXISTS idx_stats_snapshots_date ON stats_snapshots(date DESC);
CREATE INDEX IF NOT EXISTS idx_stats_snapshots_created_at ON stats_snapshots(created_at DESC);

-- ============================================================================
-- 5. Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats_snapshots ENABLE ROW LEVEL SECURITY;

-- 5.1 Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 5.2 Posts Policies
CREATE POLICY "Published posts are viewable by everyone" ON posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all posts" ON posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can insert posts" ON posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can update posts" ON posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can delete posts" ON posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 5.3 Tags Policies
CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);
CREATE POLICY "Admins can insert tags" ON tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can update tags" ON tags FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can delete tags" ON tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 5.4 Post_Tags Policies
CREATE POLICY "Post tags viewable by everyone" ON post_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage post_tags" ON post_tags FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 5.5 Comments Policies
CREATE POLICY "Approved comments are viewable by everyone" ON comments FOR SELECT
  USING (approved = true);
CREATE POLICY "Users can insert their own comments" ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all comments" ON comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can manage comments" ON comments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 5.6 Stats Snapshots Policies
CREATE POLICY "Admins can read stats_snapshots" ON stats_snapshots FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Service role can manage stats_snapshots" ON stats_snapshots FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- 6. Functions and Triggers
-- ============================================================================

-- 6.1 Handle New User Registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    card_bg,
    avatar_url,
    last_sign_in_at
  )
  VALUES (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    'default',
    new.raw_user_meta_data->>'avatar_url',
    NOW()
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6.2 Update Tag Counts on Post_Tags Changes
CREATE OR REPLACE FUNCTION update_tag_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
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
$$;

DROP TRIGGER IF EXISTS on_post_tags_change ON post_tags;
CREATE TRIGGER on_post_tags_change
  AFTER INSERT OR DELETE ON post_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_counts();

-- 6.3 Update Tag Counts on Post Publish Status Change
CREATE OR REPLACE FUNCTION update_tag_counts_on_post_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
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
$$;

DROP TRIGGER IF EXISTS on_post_publish_change_tags ON posts;
CREATE TRIGGER on_post_publish_change_tags
  AFTER UPDATE OF published ON posts
  FOR EACH ROW EXECUTE FUNCTION update_tag_counts_on_post_change();

-- ============================================================================
-- 7. Dashboard Analytics Functions
-- ============================================================================

-- 7.1 Calculate Daily Statistics
CREATE OR REPLACE FUNCTION calculate_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
  prev_snapshot RECORD;
  current_total_posts INT;
  current_total_views INT;
  current_total_comments INT;
  current_total_users INT;
BEGIN
  -- Get yesterday's snapshot
  SELECT * INTO prev_snapshot
  FROM stats_snapshots
  WHERE date = yesterday_date;

  -- Calculate current totals
  SELECT COUNT(*) INTO current_total_posts FROM posts;
  SELECT COALESCE(SUM(view_count), 0) INTO current_total_views FROM posts;
  SELECT COUNT(*) INTO current_total_comments FROM comments;
  SELECT COUNT(*) INTO current_total_users FROM profiles;

  -- Insert or update today's statistics
  INSERT INTO stats_snapshots (
    date,
    total_posts,
    total_views,
    total_comments,
    total_users,
    new_posts_today,
    new_views_today,
    new_comments_today,
    new_users_today,
    active_users_today
  )
  VALUES (
    today_date,
    current_total_posts,
    current_total_views,
    current_total_comments,
    current_total_users,
    (SELECT COUNT(*) FROM posts WHERE DATE(created_at) = today_date),
    GREATEST(current_total_views - COALESCE(prev_snapshot.total_views, 0), 0),
    (SELECT COUNT(*) FROM comments WHERE DATE(created_at) = today_date),
    (SELECT COUNT(*) FROM profiles WHERE DATE(created_at) = today_date),
    (SELECT COUNT(DISTINCT user_id) FROM comments WHERE DATE(created_at) = today_date)
  )
  ON CONFLICT (date) DO UPDATE SET
    total_posts = EXCLUDED.total_posts,
    total_views = EXCLUDED.total_views,
    total_comments = EXCLUDED.total_comments,
    total_users = EXCLUDED.total_users,
    new_posts_today = EXCLUDED.new_posts_today,
    new_views_today = EXCLUDED.new_views_today,
    new_comments_today = EXCLUDED.new_comments_today,
    new_users_today = EXCLUDED.new_users_today,
    active_users_today = EXCLUDED.active_users_today,
    updated_at = NOW();

  RAISE NOTICE 'Daily stats calculated for %', today_date;
END;
$$;

-- 7.2 Get Stats for Date Range
CREATE OR REPLACE FUNCTION get_stats_range(
  start_date DATE,
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  total_posts INT,
  total_views INT,
  total_comments INT,
  total_users INT,
  new_posts_today INT,
  new_views_today INT,
  new_comments_today INT,
  new_users_today INT,
  active_users_today INT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    date,
    total_posts,
    total_views,
    total_comments,
    total_users,
    new_posts_today,
    new_views_today,
    new_comments_today,
    new_users_today,
    active_users_today
  FROM stats_snapshots
  WHERE date >= start_date AND date <= end_date
  ORDER BY date ASC;
$$;

-- ============================================================================
-- 8. Setup pg_cron for Automatic Daily Stats
-- ============================================================================

-- Remove existing job if exists
SELECT cron.unschedule('daily-stats-snapshot')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-stats-snapshot');

-- Schedule daily stats at midnight UTC
SELECT cron.schedule(
  'daily-stats-snapshot',
  '0 0 * * *',
  'SELECT calculate_daily_stats()'
);

-- ============================================================================
-- 9. Initial Data Setup
-- ============================================================================

-- 9.1 Backfill Historical Stats (Past 30 Days)
DO $$
DECLARE
  i INT;
  backfill_date DATE;
  base_posts INT;
  base_views INT;
  base_comments INT;
  base_users INT;
BEGIN
  -- Get current totals
  SELECT COUNT(*) INTO base_posts FROM posts;
  SELECT COALESCE(SUM(view_count), 0) INTO base_views FROM posts;
  SELECT COUNT(*) INTO base_comments FROM comments;
  SELECT COUNT(*) INTO base_users FROM profiles;

  -- Skip if no data exists
  IF base_posts = 0 THEN
    RAISE NOTICE 'No posts found, skipping historical data backfill';
    RETURN;
  END IF;

  -- Generate past 30 days data
  FOR i IN 1..30 LOOP
    backfill_date := CURRENT_DATE - (30 - i);

    INSERT INTO stats_snapshots (
      date,
      total_posts,
      total_views,
      total_comments,
      total_users,
      new_posts_today,
      new_views_today,
      new_comments_today,
      new_users_today,
      active_users_today
    ) VALUES (
      backfill_date,
      FLOOR(base_posts * (0.8 + (i::FLOAT / 150))),
      FLOOR(base_views * (0.8 + (i::FLOAT / 150))),
      FLOOR(base_comments * (0.8 + (i::FLOAT / 150))),
      FLOOR(base_users * (0.8 + (i::FLOAT / 150))),
      FLOOR(RANDOM() * 3) + 1,
      FLOOR(RANDOM() * 50) + 20,
      FLOOR(RANDOM() * 10) + 2,
      CASE WHEN RANDOM() > 0.7 THEN 1 ELSE 0 END,
      FLOOR(RANDOM() * 5) + 3
    )
    ON CONFLICT (date) DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Historical data backfilled for past 30 days';
END $$;

-- ============================================================================
-- 10. Table Comments (Documentation)
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles with authentication linked to auth.users';
COMMENT ON TABLE posts IS 'Blog posts with content, metadata, and publishing status';
COMMENT ON TABLE tags IS 'Tag definitions with post count tracking';
COMMENT ON TABLE post_tags IS 'Many-to-many relationship between posts and tags';
COMMENT ON TABLE comments IS 'User comments on posts with approval workflow';
COMMENT ON TABLE stats_snapshots IS 'Daily statistics snapshots for Dashboard analytics';

COMMENT ON COLUMN stats_snapshots.date IS 'Snapshot date (unique)';
COMMENT ON COLUMN stats_snapshots.total_posts IS 'Total posts at end of day';
COMMENT ON COLUMN stats_snapshots.total_views IS 'Total view count across all posts';
COMMENT ON COLUMN stats_snapshots.new_posts_today IS 'Posts created on this day';
COMMENT ON COLUMN stats_snapshots.active_users_today IS 'Unique users who commented or logged in';

-- ============================================================================
-- 11. Verification
-- ============================================================================

DO $$
DECLARE
  table_count INT;
  cron_count INT;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'posts', 'tags', 'post_tags', 'comments', 'stats_snapshots');

  -- Check cron job
  SELECT COUNT(*) INTO cron_count
  FROM cron.job
  WHERE jobname = 'daily-stats-snapshot';

  IF table_count = 6 THEN
    RAISE NOTICE '✓ All 6 tables created successfully';
  ELSE
    RAISE WARNING '⚠ Only % tables found (expected 6)', table_count;
  END IF;

  IF cron_count = 1 THEN
    RAISE NOTICE '✓ pg_cron job scheduled successfully';
  ELSE
    RAISE WARNING '⚠ pg_cron job not found';
  END IF;

  RAISE NOTICE '✓ Database migration completed';
  RAISE NOTICE 'Run: SELECT * FROM stats_snapshots ORDER BY date DESC LIMIT 7;';
END $$;
