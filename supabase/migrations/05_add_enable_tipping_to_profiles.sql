-- Add tipping toggle switch for authors
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enable_tipping BOOLEAN DEFAULT false;