-- Improve OAuth-created profile metadata for providers like GitHub.
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
    COALESCE(
      NULLIF(new.raw_user_meta_data->>'full_name', ''),
      NULLIF(new.raw_user_meta_data->>'name', ''),
      NULLIF(new.raw_user_meta_data->>'user_name', ''),
      NULLIF(new.raw_user_meta_data->>'preferred_username', ''),
      split_part(new.email, '@', 1)
    ),
    'default',
    COALESCE(
      NULLIF(new.raw_user_meta_data->>'avatar_url', ''),
      NULLIF(new.raw_user_meta_data->>'picture', '')
    ),
    NOW()
  );
  RETURN new;
END;
$$;
