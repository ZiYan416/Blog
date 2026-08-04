ALTER TABLE public.posts
  ADD COLUMN public_id INTEGER;

WITH public_id_base AS (
  SELECT COALESCE(MAX(public_id), 99999) AS value
  FROM public.posts
),
numbered_posts AS (
  SELECT
    post.id,
    (public_id_base.value + ROW_NUMBER() OVER (
      ORDER BY post.created_at, post.id
    ))::INTEGER AS public_id
  FROM public.posts AS post
  CROSS JOIN public_id_base
  WHERE post.public_id IS NULL
)
UPDATE public.posts AS post
SET public_id = numbered_posts.public_id
FROM numbered_posts
WHERE post.id = numbered_posts.id;

ALTER TABLE public.posts
  ALTER COLUMN public_id SET NOT NULL,
  ALTER COLUMN public_id ADD GENERATED ALWAYS AS IDENTITY (START WITH 100000);

SELECT setval(
  pg_get_serial_sequence('public.posts', 'public_id'),
  COALESCE(MAX(public_id), 99999),
  true
)
FROM public.posts;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_public_id_key UNIQUE (public_id),
  ADD CONSTRAINT posts_public_id_six_digits_check CHECK (public_id >= 100000);

COMMENT ON COLUMN public.posts.public_id IS
  'Stable public article number used as the canonical URL identifier.';
