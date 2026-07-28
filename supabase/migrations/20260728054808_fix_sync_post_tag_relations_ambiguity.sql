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
