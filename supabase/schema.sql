-- ============================================================================
-- Blog database schema (authoritative consolidated version)
-- ============================================================================
-- Consolidated on 2026-07-27 from migrations 00-06 after a live-schema,
-- application-access, RLS, grants, storage, and advisor audit.
--
-- This file is safe for a fresh Supabase project and converges the supported
-- objects on an existing project. It intentionally contains no synthetic data.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

-- ============================================================================
-- 1. Core tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  card_bg TEXT DEFAULT 'default',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  last_sign_in_at TIMESTAMPTZ,
  alipay_qr TEXT,
  wechat_qr TEXT,
  enable_tipping BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS card_bg TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS alipay_qr TEXT,
  ADD COLUMN IF NOT EXISTS wechat_qr TEXT,
  ADD COLUMN IF NOT EXISTS enable_tipping BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS excerpt TEXT,
  ADD COLUMN IF NOT EXISTS cover_image TEXT,
  ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS author_id UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.posts
SET published_at = created_at
WHERE published = true
  AND published_at IS NULL;

UPDATE public.posts
SET published_at = NULL
WHERE published = false
  AND published_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  post_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tags
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE public.post_tags
  ADD COLUMN IF NOT EXISTS post_id UUID,
  ADD COLUMN IF NOT EXISTS tag_id UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  reply_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS post_id UUID,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS parent_id UUID,
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.stats_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_posts INTEGER NOT NULL DEFAULT 0,
  total_views INTEGER NOT NULL DEFAULT 0,
  total_comments INTEGER NOT NULL DEFAULT 0,
  total_users INTEGER NOT NULL DEFAULT 0,
  new_posts_today INTEGER NOT NULL DEFAULT 0,
  new_views_today INTEGER NOT NULL DEFAULT 0,
  new_comments_today INTEGER NOT NULL DEFAULT 0,
  new_users_today INTEGER NOT NULL DEFAULT 0,
  active_users_today INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stats_snapshots
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS total_posts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_comments INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_users INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS new_posts_today INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS new_views_today INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS new_comments_today INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS new_users_today INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active_users_today INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats_snapshots ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. Shared authorization helper
-- ============================================================================

-- ============================================================================
-- 1. Shared authorization helper
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    (
      SELECT profile.is_admin
      FROM public.profiles AS profile
      WHERE profile.id = auth.uid()
    ),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_current_user_admin()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

-- ============================================================================
-- 2. Profiles: private table plus an intentionally narrow public projection
-- ============================================================================

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own safe profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view permitted profiles"
  ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update permitted profiles"
  ON public.profiles;

CREATE POLICY "Authenticated users can view permitted profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR (SELECT public.is_current_user_admin())
  );

CREATE POLICY "Authenticated users can update permitted profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR (SELECT public.is_current_user_admin())
  )
  WITH CHECK (
    (SELECT auth.uid()) = id
    OR (SELECT public.is_current_user_admin())
  );

REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT UPDATE (
  display_name,
  avatar_url,
  bio,
  website,
  card_bg,
  alipay_qr,
  wechat_qr,
  enable_tipping,
  updated_at
) ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class AS relation
    JOIN pg_namespace AS namespace
      ON namespace.oid = relation.relnamespace
    WHERE namespace.nspname = 'public'
      AND relation.relname = 'public_profiles'
      AND relation.relkind = 'v'
  ) THEN
    EXECUTE 'DROP VIEW public.public_profiles';
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.public_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  card_bg TEXT,
  created_at TIMESTAMPTZ,
  alipay_qr TEXT,
  wechat_qr TEXT,
  enable_tipping BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone"
  ON public.public_profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.public_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

REVOKE ALL ON public.public_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.sync_public_profile_projection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.public_profiles (
    id,
    display_name,
    avatar_url,
    bio,
    website,
    card_bg,
    created_at,
    alipay_qr,
    wechat_qr,
    enable_tipping
  )
  VALUES (
    NEW.id,
    NEW.display_name,
    NEW.avatar_url,
    NEW.bio,
    NEW.website,
    NEW.card_bg,
    NEW.created_at,
    CASE WHEN NEW.enable_tipping THEN NEW.alipay_qr ELSE NULL END,
    CASE WHEN NEW.enable_tipping THEN NEW.wechat_qr ELSE NULL END,
    COALESCE(NEW.enable_tipping, false)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    website = EXCLUDED.website,
    card_bg = EXCLUDED.card_bg,
    created_at = EXCLUDED.created_at,
    alipay_qr = EXCLUDED.alipay_qr,
    wechat_qr = EXCLUDED.wechat_qr,
    enable_tipping = EXCLUDED.enable_tipping;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_public_profile_projection()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_profile_public_projection_change
  ON public.profiles;
CREATE TRIGGER on_profile_public_projection_change
  AFTER INSERT OR UPDATE OF
    display_name,
    avatar_url,
    bio,
    website,
    card_bg,
    created_at,
    alipay_qr,
    wechat_qr,
    enable_tipping
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_public_profile_projection();

INSERT INTO public.public_profiles (
  id,
  display_name,
  avatar_url,
  bio,
  website,
  card_bg,
  created_at,
  alipay_qr,
  wechat_qr,
  enable_tipping
)
SELECT
  id,
  display_name,
  avatar_url,
  bio,
  website,
  card_bg,
  created_at,
  CASE WHEN enable_tipping THEN alipay_qr ELSE NULL END,
  CASE WHEN enable_tipping THEN wechat_qr ELSE NULL END,
  COALESCE(enable_tipping, false)
FROM public.profiles
ON CONFLICT (id) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  website = EXCLUDED.website,
  card_bg = EXCLUDED.card_bg,
  created_at = EXCLUDED.created_at,
  alipay_qr = EXCLUDED.alipay_qr,
  wechat_qr = EXCLUDED.wechat_qr,
  enable_tipping = EXCLUDED.enable_tipping;

CREATE OR REPLACE FUNCTION public.set_user_admin(
  target_user_id UUID,
  enabled BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Administrator access required'
      USING ERRCODE = '42501';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Administrators cannot change their own role'
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles
  SET
    is_admin = enabled,
    updated_at = NOW()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user does not exist'
      USING ERRCODE = 'P0002';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.set_user_admin(UUID, BOOLEAN)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_admin(UUID, BOOLEAN) TO authenticated;

-- ============================================================================
-- 3. Replace recursive role checks in table policies
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Posts can be deleted by owner" ON public.posts;
DROP POLICY IF EXISTS "Posts can be inserted by authenticated users" ON public.posts;
DROP POLICY IF EXISTS "Posts can be updated by owner" ON public.posts;
DROP POLICY IF EXISTS "Public posts are viewable by everyone, authors can view own"
  ON public.posts;
DROP POLICY IF EXISTS "Anonymous users can view published posts"
  ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view permitted posts"
  ON public.posts;

CREATE POLICY "Anonymous users can view published posts"
  ON public.posts FOR SELECT TO anon
  USING (published = true);
CREATE POLICY "Authenticated users can view permitted posts"
  ON public.posts FOR SELECT TO authenticated
  USING (
    published = true
    OR (SELECT public.is_current_user_admin())
  );
CREATE POLICY "Admins can insert posts"
  ON public.posts FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_current_user_admin()));
CREATE POLICY "Admins can update posts"
  ON public.posts FOR UPDATE TO authenticated
  USING ((SELECT public.is_current_user_admin()))
  WITH CHECK ((SELECT public.is_current_user_admin()));
CREATE POLICY "Admins can delete posts"
  ON public.posts FOR DELETE TO authenticated
  USING ((SELECT public.is_current_user_admin()));

REVOKE ALL ON public.posts FROM anon, authenticated;
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.posts TO authenticated;

DROP POLICY IF EXISTS "Admins can insert tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can update tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can delete tags" ON public.tags;
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.tags;
DROP POLICY IF EXISTS "Tags can be deleted by authenticated users" ON public.tags;
DROP POLICY IF EXISTS "Tags can be inserted by authenticated users" ON public.tags;
DROP POLICY IF EXISTS "Tags can be updated by authenticated users" ON public.tags;

CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "Admins can insert tags"
  ON public.tags FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_current_user_admin()));
CREATE POLICY "Admins can update tags"
  ON public.tags FOR UPDATE TO authenticated
  USING ((SELECT public.is_current_user_admin()))
  WITH CHECK ((SELECT public.is_current_user_admin()));
CREATE POLICY "Admins can delete tags"
  ON public.tags FOR DELETE TO authenticated
  USING ((SELECT public.is_current_user_admin()));

REVOKE ALL ON public.tags FROM anon, authenticated;
GRANT SELECT ON public.tags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tags TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can manage post_tags" ON public.post_tags;
DROP POLICY IF EXISTS "Admins can manage post_tags" ON public.post_tags;
DROP POLICY IF EXISTS "Users can view post tags" ON public.post_tags;
DROP POLICY IF EXISTS "Anonymous users can view published post tags"
  ON public.post_tags;
DROP POLICY IF EXISTS "Authenticated users can view permitted post tags"
  ON public.post_tags;
CREATE POLICY "Anonymous users can view published post tags"
  ON public.post_tags
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts AS related_post
      WHERE related_post.id = post_tags.post_id
        AND related_post.published = true
    )
  );
CREATE POLICY "Authenticated users can view permitted post tags"
  ON public.post_tags
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts AS related_post
      WHERE related_post.id = post_tags.post_id
        AND (
          related_post.published = true
          OR (SELECT public.is_current_user_admin())
        )
    )
  );

REVOKE ALL ON public.post_tags FROM anon, authenticated;
GRANT SELECT ON public.post_tags TO anon, authenticated;

DROP POLICY IF EXISTS "Admins can read stats_snapshots" ON public.stats_snapshots;
CREATE POLICY "Admins can read stats_snapshots"
  ON public.stats_snapshots FOR SELECT TO authenticated
  USING ((SELECT public.is_current_user_admin()));

REVOKE ALL ON public.stats_snapshots FROM anon, authenticated;
GRANT SELECT ON public.stats_snapshots TO authenticated;

-- ============================================================================
-- 4. Comments: enforce moderation and validate reply ownership
-- ============================================================================

CREATE OR REPLACE FUNCTION private.is_valid_comment_parent(
  candidate_parent_id UUID,
  candidate_post_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.comments AS parent_comment
    WHERE parent_comment.id = candidate_parent_id
      AND parent_comment.post_id = candidate_post_id
      AND parent_comment.approved = true
  );
$$;

REVOKE ALL ON FUNCTION private.is_valid_comment_parent(UUID, UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_valid_comment_parent(UUID, UUID)
  TO authenticated;

DROP POLICY IF EXISTS "Users can insert their own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can manage comments" ON public.comments;
DROP POLICY IF EXISTS "Approved comments are viewable by everyone"
  ON public.comments;
DROP POLICY IF EXISTS "Users can insert moderated comments" ON public.comments;
DROP POLICY IF EXISTS "Users can view their own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can update comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;
DROP POLICY IF EXISTS "Anonymous users can view approved comments"
  ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can view permitted comments"
  ON public.comments;

CREATE POLICY "Users can insert moderated comments"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = comments.user_id
    AND (
      comments.approved = false
      OR (SELECT public.is_current_user_admin())
    )
    AND (
      comments.parent_id IS NULL
      OR (
        SELECT private.is_valid_comment_parent(
          comments.parent_id,
          comments.post_id
        )
      )
    )
  );

CREATE POLICY "Anonymous users can view approved comments"
  ON public.comments FOR SELECT TO anon
  USING (approved = true);

CREATE POLICY "Authenticated users can view permitted comments"
  ON public.comments FOR SELECT TO authenticated
  USING (
    approved = true
    OR (SELECT auth.uid()) = comments.user_id
    OR (SELECT public.is_current_user_admin())
  );

CREATE POLICY "Admins can update comments"
  ON public.comments FOR UPDATE TO authenticated
  USING ((SELECT public.is_current_user_admin()))
  WITH CHECK ((SELECT public.is_current_user_admin()));

CREATE POLICY "Admins can delete comments"
  ON public.comments FOR DELETE TO authenticated
  USING ((SELECT public.is_current_user_admin()));

REVOKE ALL ON public.comments FROM anon, authenticated;
GRANT SELECT ON public.comments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.comments TO authenticated;

CREATE OR REPLACE FUNCTION public.sync_comment_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  old_parent_id UUID;
  new_parent_id UUID;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    old_parent_id := OLD.parent_id;
  END IF;

  IF TG_OP <> 'DELETE' THEN
    new_parent_id := NEW.parent_id;
  END IF;

  IF old_parent_id IS NOT NULL THEN
    UPDATE public.comments AS parent_comment
    SET reply_count = (
      SELECT COUNT(*)::INTEGER
      FROM public.comments AS reply
      WHERE reply.parent_id = old_parent_id
        AND reply.approved = true
    )
    WHERE parent_comment.id = old_parent_id;
  END IF;

  IF new_parent_id IS NOT NULL AND new_parent_id IS DISTINCT FROM old_parent_id THEN
    UPDATE public.comments AS parent_comment
    SET reply_count = (
      SELECT COUNT(*)::INTEGER
      FROM public.comments AS reply
      WHERE reply.parent_id = new_parent_id
        AND reply.approved = true
    )
    WHERE parent_comment.id = new_parent_id;
  ELSIF new_parent_id IS NOT NULL AND TG_OP = 'UPDATE' THEN
    UPDATE public.comments AS parent_comment
    SET reply_count = (
      SELECT COUNT(*)::INTEGER
      FROM public.comments AS reply
      WHERE reply.parent_id = new_parent_id
        AND reply.approved = true
    )
    WHERE parent_comment.id = new_parent_id;
  END IF;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_comment_reply_count()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_comment_reply_change ON public.comments;
CREATE TRIGGER on_comment_reply_change
  AFTER INSERT OR DELETE OR UPDATE OF approved, parent_id
  ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_comment_reply_count();

UPDATE public.comments AS parent_comment
SET reply_count = (
  SELECT COUNT(*)::INTEGER
  FROM public.comments AS reply
  WHERE reply.parent_id = parent_comment.id
    AND reply.approved = true
);

-- ============================================================================
-- 5. Atomic public view counter
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_post_view(post_slug TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  next_count INTEGER;
BEGIN
  UPDATE public.posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE slug = post_slug
    AND published = true
  RETURNING view_count INTO next_count;

  RETURN next_count;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_post_view(TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_post_view(TEXT) TO anon, authenticated;

-- ============================================================================
-- 6. Transactional post and tag writes
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_post_tag_relations(
  target_post_id UUID,
  tag_names TEXT[],
  tag_slugs TEXT[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  tag_index INTEGER;
  resolved_tag_id UUID;
  tag_name TEXT;
  tag_slug TEXT;
BEGIN
  IF CARDINALITY(COALESCE(tag_names, ARRAY[]::TEXT[]))
    <> CARDINALITY(COALESCE(tag_slugs, ARRAY[]::TEXT[])) THEN
    RAISE EXCEPTION 'Tag names and slugs must have equal lengths'
      USING ERRCODE = '22023';
  END IF;

  DELETE FROM public.post_tags
  WHERE post_id = target_post_id;

  IF COALESCE(CARDINALITY(tag_names), 0) = 0 THEN
    RETURN;
  END IF;

  FOR tag_index IN 1..CARDINALITY(tag_names) LOOP
    tag_name := BTRIM(tag_names[tag_index]);
    tag_slug := BTRIM(tag_slugs[tag_index]);

    IF tag_name = '' OR tag_slug = '' THEN
      RAISE EXCEPTION 'Tag names and slugs cannot be empty'
        USING ERRCODE = '22023';
    END IF;

    BEGIN
      INSERT INTO public.tags (name, slug)
      VALUES (tag_name, tag_slug)
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id INTO resolved_tag_id;
    EXCEPTION
      WHEN unique_violation THEN
        SELECT existing_tag.id
        INTO resolved_tag_id
        FROM public.tags AS existing_tag
        WHERE existing_tag.name = tag_name;

        IF resolved_tag_id IS NULL THEN
          INSERT INTO public.tags (name, slug)
          VALUES (
            tag_name,
            tag_slug || '-' || SUBSTRING(MD5(tag_name) FROM 1 FOR 8)
          )
          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id INTO resolved_tag_id;
        END IF;
    END;

    INSERT INTO public.post_tags (post_id, tag_id)
    VALUES (target_post_id, resolved_tag_id)
    ON CONFLICT (post_id, tag_id) DO NOTHING;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_post_tag_relations(UUID, TEXT[], TEXT[])
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_post_with_tags(
  p_title TEXT,
  p_slug TEXT,
  p_content TEXT,
  p_excerpt TEXT,
  p_cover_image TEXT,
  p_tag_names TEXT[],
  p_tag_slugs TEXT[],
  p_category TEXT,
  p_published BOOLEAN
)
RETURNS SETOF public.posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  created_post public.posts%ROWTYPE;
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Administrator access required'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.posts (
    title,
    slug,
    content,
    excerpt,
    cover_image,
    category,
    published,
    published_at,
    author_id
  )
  VALUES (
    p_title,
    p_slug,
    p_content,
    p_excerpt,
    p_cover_image,
    p_category,
    p_published,
    CASE WHEN p_published THEN NOW() ELSE NULL END,
    auth.uid()
  )
  RETURNING * INTO created_post;

  PERFORM public.sync_post_tag_relations(
    created_post.id,
    p_tag_names,
    p_tag_slugs
  );

  RETURN NEXT created_post;
END;
$$;

REVOKE ALL ON FUNCTION public.create_post_with_tags(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[], TEXT, BOOLEAN
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_post_with_tags(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[], TEXT, BOOLEAN
) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_post_with_tags(
  p_current_slug TEXT,
  p_title TEXT,
  p_new_slug TEXT,
  p_content TEXT,
  p_excerpt TEXT,
  p_cover_image TEXT,
  p_tag_names TEXT[],
  p_tag_slugs TEXT[],
  p_category TEXT,
  p_published BOOLEAN
)
RETURNS SETOF public.posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  updated_post public.posts%ROWTYPE;
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Administrator access required'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.posts
  SET
    title = p_title,
    slug = p_new_slug,
    content = p_content,
    excerpt = p_excerpt,
    cover_image = p_cover_image,
    category = p_category,
    published = p_published,
    published_at = CASE
      WHEN p_published THEN COALESCE(post.published_at, NOW())
      ELSE NULL
    END,
    updated_at = NOW()
  WHERE post.slug = p_current_slug
  RETURNING * INTO updated_post;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post does not exist'
      USING ERRCODE = 'P0002';
  END IF;

  PERFORM public.sync_post_tag_relations(
    updated_post.id,
    p_tag_names,
    p_tag_slugs
  );

  RETURN NEXT updated_post;
END;
$$;

REVOKE ALL ON FUNCTION public.update_post_with_tags(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[], TEXT, BOOLEAN
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_post_with_tags(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[], TEXT, BOOLEAN
) TO authenticated;

-- ============================================================================
-- 7. Registration, derived data, timestamps, and analytics
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      NULLIF(NEW.raw_user_meta_data->>'user_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'preferred_username', ''),
      SPLIT_PART(NEW.email, '@', 1)
    ),
    'default',
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
      NULLIF(NEW.raw_user_meta_data->>'picture', '')
    ),
    COALESCE(NEW.last_sign_in_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    last_sign_in_at = EXCLUDED.last_sign_in_at;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.sync_auth_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.profiles
  SET
    email = NEW.email,
    last_sign_in_at = NEW.last_sign_in_at,
    display_name = COALESCE(
      profiles.display_name,
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      NULLIF(NEW.raw_user_meta_data->>'user_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'preferred_username', ''),
      SPLIT_PART(NEW.email, '@', 1)
    ),
    avatar_url = COALESCE(
      profiles.avatar_url,
      NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
      NULLIF(NEW.raw_user_meta_data->>'picture', '')
    ),
    updated_at = NOW()
  WHERE profiles.id = NEW.id;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_auth_user_profile()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, last_sign_in_at, raw_user_meta_data
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_user_profile();

CREATE OR REPLACE FUNCTION public.update_tag_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  affected_tag_id UUID;
BEGIN
  affected_tag_id := CASE
    WHEN TG_OP = 'DELETE' THEN OLD.tag_id
    ELSE NEW.tag_id
  END;

  UPDATE public.tags AS tag
  SET post_count = (
    SELECT COUNT(*)::INTEGER
    FROM public.post_tags AS relation
    JOIN public.posts AS post
      ON post.id = relation.post_id
    WHERE relation.tag_id = affected_tag_id
      AND post.published = true
  )
  WHERE tag.id = affected_tag_id;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.update_tag_counts()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_post_tags_change ON public.post_tags;
CREATE TRIGGER on_post_tags_change
  AFTER INSERT OR DELETE ON public.post_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tag_counts();

CREATE OR REPLACE FUNCTION public.update_tag_counts_on_post_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.published IS DISTINCT FROM NEW.published THEN
    UPDATE public.tags AS tag
    SET post_count = (
      SELECT COUNT(*)::INTEGER
      FROM public.post_tags AS relation
      JOIN public.posts AS post
        ON post.id = relation.post_id
      WHERE relation.tag_id = tag.id
        AND post.published = true
    )
    WHERE EXISTS (
      SELECT 1
      FROM public.post_tags AS affected_relation
      WHERE affected_relation.post_id = NEW.id
        AND affected_relation.tag_id = tag.id
    );
  END IF;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.update_tag_counts_on_post_change()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_post_publish_change_tags ON public.posts;
CREATE TRIGGER on_post_publish_change_tags
  AFTER UPDATE OF published ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tag_counts_on_post_change();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.update_updated_at_column()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_posts_updated_at ON public.posts;
CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_comments_updated_at ON public.comments;
CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_stats_snapshots_updated_at
  ON public.stats_snapshots;
CREATE TRIGGER set_stats_snapshots_updated_at
  BEFORE UPDATE ON public.stats_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.calculate_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  analytics_timezone CONSTANT TEXT := 'Asia/Shanghai';
  snapshot_date DATE :=
    (NOW() AT TIME ZONE analytics_timezone)::DATE - 1;
  snapshot_start TIMESTAMPTZ :=
    snapshot_date::TIMESTAMP AT TIME ZONE analytics_timezone;
  snapshot_end TIMESTAMPTZ := snapshot_start + INTERVAL '1 day';
  previous_total_views INTEGER := 0;
  current_total_views INTEGER := 0;
BEGIN
  SELECT snapshot.total_views
  INTO previous_total_views
  FROM public.stats_snapshots AS snapshot
  WHERE snapshot.date < snapshot_date
  ORDER BY snapshot.date DESC
  LIMIT 1;

  SELECT COALESCE(SUM(post.view_count), 0)::INTEGER
  INTO current_total_views
  FROM public.posts AS post
  WHERE post.published = true;

  INSERT INTO public.stats_snapshots (
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
  SELECT
    snapshot_date,
    (SELECT COUNT(*)::INTEGER FROM public.posts WHERE published = true),
    current_total_views,
    (SELECT COUNT(*)::INTEGER FROM public.comments),
    (SELECT COUNT(*)::INTEGER FROM public.profiles),
    (
      SELECT COUNT(*)::INTEGER
      FROM public.posts
      WHERE published = true
        AND published_at >= snapshot_start
        AND published_at < snapshot_end
    ),
    GREATEST(current_total_views - COALESCE(previous_total_views, 0), 0),
    (
      SELECT COUNT(*)::INTEGER
      FROM public.comments
      WHERE created_at >= snapshot_start
        AND created_at < snapshot_end
    ),
    (
      SELECT COUNT(*)::INTEGER
      FROM public.profiles
      WHERE created_at >= snapshot_start
        AND created_at < snapshot_end
    ),
    (
      SELECT COUNT(DISTINCT user_id)::INTEGER
      FROM public.comments
      WHERE created_at >= snapshot_start
        AND created_at < snapshot_end
    )
  ON CONFLICT (date) DO UPDATE
  SET
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
END;
$$;

REVOKE ALL ON FUNCTION public.calculate_daily_stats()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_daily_stats() TO service_role;

-- ============================================================================
-- 8. Version storage configuration and ownership policies
-- ============================================================================

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES
  (
    'avatars',
    'avatars',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'blog-images',
    'blog-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can read avatar objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can read post image objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload post image objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update post image objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete post image objects" ON storage.objects;
DROP POLICY IF EXISTS "Avatar public view policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Images can be deleted by owner" ON storage.objects;
DROP POLICY IF EXISTS "Images can be downloaded by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Images can be uploaded by authenticated users"
  ON storage.objects;

CREATE POLICY "Users can upload their own avatar objects"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );

CREATE POLICY "Users can update their own avatar objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );

CREATE POLICY "Users can delete their own avatar objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );

CREATE POLICY "Admins can upload post image objects"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images'
    AND (SELECT public.is_current_user_admin())
  );

CREATE POLICY "Admins can update post image objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'blog-images'
    AND (SELECT public.is_current_user_admin())
  )
  WITH CHECK (
    bucket_id = 'blog-images'
    AND (SELECT public.is_current_user_admin())
  );

CREATE POLICY "Admins can delete post image objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'blog-images'
    AND (SELECT public.is_current_user_admin())
  );

-- ============================================================================
-- 9. Query indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_posts_author
  ON public.posts (author_id);

CREATE INDEX IF NOT EXISTS idx_posts_public_listing
  ON public.posts (featured DESC, created_at DESC)
  WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_posts_public_category
  ON public.posts (category, created_at DESC)
  WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_tags_popularity
  ON public.tags (post_count DESC, name);

CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id
  ON public.post_tags (tag_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_id
  ON public.comments (post_id);

CREATE INDEX IF NOT EXISTS idx_comments_user_id
  ON public.comments (user_id);

CREATE INDEX IF NOT EXISTS idx_comments_parent_id
  ON public.comments (parent_id)
  WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_comments_public_thread
  ON public.comments (post_id, created_at DESC)
  WHERE approved = true;

CREATE INDEX IF NOT EXISTS idx_comments_pending
  ON public.comments (created_at DESC)
  WHERE approved = false;

CREATE INDEX IF NOT EXISTS idx_stats_snapshots_created_at
  ON public.stats_snapshots (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_published_at
  ON public.posts (published_at DESC)
  WHERE published = true;

-- ============================================================================
-- 10. Daily analytics schedule
-- ============================================================================

DO $$
DECLARE
  existing_job_id BIGINT;
BEGIN
  FOR existing_job_id IN
    SELECT jobid
    FROM cron.job
    WHERE jobname = 'daily-stats-snapshot'
  LOOP
    PERFORM cron.unschedule(existing_job_id);
  END LOOP;

  PERFORM cron.schedule(
    'daily-stats-snapshot',
    '5 16 * * *',
    'SELECT public.calculate_daily_stats()'
  );
END;
$$;

-- ============================================================================
-- 11. Object documentation
-- ============================================================================

COMMENT ON TABLE public.profiles IS
  'Private user profiles linked to auth.users; protected by RLS.';
COMMENT ON TABLE public.public_profiles IS
  'Read-only public projection of non-sensitive profile fields.';
COMMENT ON TABLE public.posts IS
  'Blog posts with publication state and transitional JSON tag names.';
COMMENT ON TABLE public.tags IS
  'Canonical tag definitions with derived published-post counts.';
COMMENT ON TABLE public.post_tags IS
  'Canonical many-to-many relation between posts and tags.';
COMMENT ON TABLE public.comments IS
  'Moderated, threaded comments; reply_count includes approved replies only.';
COMMENT ON TABLE public.stats_snapshots IS
  'Daily analytics snapshots generated by calculate_daily_stats.';

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE
  public.profiles,
  public.public_profiles,
  public.posts,
  public.tags,
  public.post_tags,
  public.comments,
  public.stats_snapshots
TO service_role;
