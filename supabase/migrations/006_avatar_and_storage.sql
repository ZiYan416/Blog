-- 1. 为 profiles 表添加头像字段
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. 创建用于存储头像的 storage 桶 (如果不存在)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. 允许已登录用户上传头像到自己的文件夹
DROP POLICY IF EXISTS "Avatar upload policy" ON storage.objects;
CREATE POLICY "Avatar upload policy"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- 4. 允许所有人查看头像
DROP POLICY IF EXISTS "Avatar public view policy" ON storage.objects;
CREATE POLICY "Avatar public view policy"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
