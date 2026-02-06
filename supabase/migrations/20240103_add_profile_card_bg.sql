-- Add card_bg column to profiles table
-- This column will store the background style key for the user card (popover)
-- Example values: 'default', 'blue_gradient', 'pink_gradient', 'sunset', etc.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS card_bg TEXT DEFAULT 'default';
