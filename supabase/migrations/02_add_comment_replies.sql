-- ============================================================================
-- 添加评论回复功能
-- ============================================================================
-- 创建时间：2026-02-11
-- 用途：支持用户回复其他评论，构建评论树结构
-- ============================================================================

-- 1. 添加 parent_id 字段支持评论回复
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- 2. 添加索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- 3. 添加 reply_count 字段（可选，用于显示回复数量）
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

-- 4. 创建触发器函数：更新父评论的回复数量
CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- 当插入回复时，增加父评论的回复数
  IF (TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL) THEN
    UPDATE comments
    SET reply_count = reply_count + 1
    WHERE id = NEW.parent_id;
  END IF;

  -- 当删除回复时，减少父评论的回复数
  IF (TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL) THEN
    UPDATE comments
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = OLD.parent_id;
  END IF;

  RETURN NULL;
END;
$$;

-- 5. 创建触发器
DROP TRIGGER IF EXISTS on_comment_reply_change ON comments;
CREATE TRIGGER on_comment_reply_change
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_reply_count();

-- 6. 初始化现有评论的回复数量（如果有数据）
UPDATE comments c
SET reply_count = (
  SELECT COUNT(*)
  FROM comments r
  WHERE r.parent_id = c.id
);

-- ============================================================================
-- 验证
-- ============================================================================

DO $$
DECLARE
  column_exists BOOLEAN;
  index_exists BOOLEAN;
  trigger_exists BOOLEAN;
BEGIN
  -- 检查 parent_id 列是否存在
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'comments'
    AND column_name = 'parent_id'
  ) INTO column_exists;

  -- 检查索引是否存在
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'comments'
    AND indexname = 'idx_comments_parent_id'
  ) INTO index_exists;

  -- 检查触发器是否存在
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_comment_reply_change'
  ) INTO trigger_exists;

  IF column_exists THEN
    RAISE NOTICE '✓ parent_id column added successfully';
  ELSE
    RAISE WARNING '⚠ parent_id column not found';
  END IF;

  IF index_exists THEN
    RAISE NOTICE '✓ Index on parent_id created successfully';
  ELSE
    RAISE WARNING '⚠ Index on parent_id not found';
  END IF;

  IF trigger_exists THEN
    RAISE NOTICE '✓ Reply count trigger created successfully';
  ELSE
    RAISE WARNING '⚠ Reply count trigger not found';
  END IF;

  RAISE NOTICE '✓ Comment replies migration completed';
END $$;
