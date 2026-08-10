-- Keep editor autosaves separate from the canonical posts table so they never
-- change published content until an explicit save or publish action occurs.
CREATE TABLE IF NOT EXISTS public.post_autosaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  slug TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  base_post_updated_at TIMESTAMPTZ,
  version BIGINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT post_autosaves_post_base_updated_at_check
    CHECK (post_id IS NULL OR base_post_updated_at IS NOT NULL),
  CONSTRAINT post_autosaves_version_check
    CHECK (version >= 1)
);

ALTER TABLE public.post_autosaves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view own post autosaves"
  ON public.post_autosaves;
DROP POLICY IF EXISTS "Admins can insert own post autosaves"
  ON public.post_autosaves;
DROP POLICY IF EXISTS "Admins can update own post autosaves"
  ON public.post_autosaves;
DROP POLICY IF EXISTS "Admins can delete own post autosaves"
  ON public.post_autosaves;

CREATE POLICY "Admins can view own post autosaves"
  ON public.post_autosaves FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = author_id
    AND (SELECT public.is_current_user_admin())
  );
CREATE POLICY "Admins can insert own post autosaves"
  ON public.post_autosaves FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = author_id
    AND (SELECT public.is_current_user_admin())
  );
CREATE POLICY "Admins can update own post autosaves"
  ON public.post_autosaves FOR UPDATE TO authenticated
  USING (
    (SELECT auth.uid()) = author_id
    AND (SELECT public.is_current_user_admin())
  )
  WITH CHECK (
    (SELECT auth.uid()) = author_id
    AND (SELECT public.is_current_user_admin())
  );
CREATE POLICY "Admins can delete own post autosaves"
  ON public.post_autosaves FOR DELETE TO authenticated
  USING (
    (SELECT auth.uid()) = author_id
    AND (SELECT public.is_current_user_admin())
  );

REVOKE ALL ON public.post_autosaves FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_autosaves TO authenticated;
GRANT ALL ON TABLE public.post_autosaves TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS idx_post_autosaves_author_post
  ON public.post_autosaves (author_id, post_id)
  WHERE post_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_post_autosaves_author_new
  ON public.post_autosaves (author_id)
  WHERE post_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_post_autosaves_author_updated_at
  ON public.post_autosaves (author_id, updated_at DESC);

DROP TRIGGER IF EXISTS set_post_autosaves_updated_at ON public.post_autosaves;
CREATE TRIGGER set_post_autosaves_updated_at
  BEFORE UPDATE ON public.post_autosaves
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.post_autosaves IS
  'Private administrator autosaves kept separate from published post content.';
