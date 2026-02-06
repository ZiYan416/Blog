-- Update handle_new_user function to include new fields
-- This ensures new users get their email and default settings correctly populated in the profiles table

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    card_bg,
    avatar_url
  )
  VALUES (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    'default', -- Default card background
    new.raw_user_meta_data->>'avatar_url' -- Support avatar from OAuth (GitHub, etc.)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
