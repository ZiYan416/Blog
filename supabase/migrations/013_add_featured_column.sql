-- Add featured column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Create index for faster querying of featured posts
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured);

-- Update RLS policies if necessary (Admins can already update all columns)
-- No changes needed for RLS as 'update posts' policy covers all columns
