-- ============================================================================
-- 添加管理员更新用户 Profile 的权限
-- ============================================================================
-- 创建时间：2026-02-11
-- 用途：允许管理员修改其他用户的 is_admin 等字段
-- ============================================================================

-- 添加管理员更新其他用户 profile 的策略
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================================
-- 验证
-- ============================================================================

DO $$
DECLARE
  policy_count INT;
BEGIN
  -- 检查策略是否创建成功
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND policyname = 'Admins can update any profile';

  IF policy_count = 1 THEN
    RAISE NOTICE '✓ Admin profile update policy created successfully';
  ELSE
    RAISE WARNING '⚠ Admin profile update policy not found';
  END IF;
END $$;
