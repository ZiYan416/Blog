-- Track publication time separately from draft creation time.
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

UPDATE public.posts
SET published_at = created_at
WHERE published = true
  AND published_at IS NULL;

UPDATE public.posts
SET published_at = NULL
WHERE published = false
  AND published_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_published_at
  ON public.posts (published_at DESC)
  WHERE published = true;

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

  UPDATE public.posts AS post
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

UPDATE public.stats_snapshots AS snapshot
SET
  total_posts = (
    SELECT COUNT(*)::INTEGER
    FROM public.posts AS post
    WHERE post.published_at <
      ((snapshot.date + 1)::TIMESTAMP AT TIME ZONE 'Asia/Shanghai')
  ),
  new_posts_today = (
    SELECT COUNT(*)::INTEGER
    FROM public.posts AS post
    WHERE post.published = true
      AND post.published_at >=
        (snapshot.date::TIMESTAMP AT TIME ZONE 'Asia/Shanghai')
      AND post.published_at <
        ((snapshot.date + 1)::TIMESTAMP AT TIME ZONE 'Asia/Shanghai')
  );
