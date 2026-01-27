-- 插入初始标签数据
INSERT INTO tags (name, slug, post_count) VALUES
  ('技术', 'tech', 0),
  ('生活', 'life', 0),
  ('随笔', 'essay', 0),
  ('教程', 'tutorial', 0)
ON CONFLICT (slug) DO NOTHING;

-- 插入示例文章数据（可选，可以在配置 Supabase Auth 后再插入）
-- INSERT INTO posts (title, slug, content, excerpt, published, featured, author_id, tags)
-- VALUES (
--   '欢迎使用 My Blog',
--   'welcome-to-my-blog',
--   '# 欢迎来到我的博客\n\n这是第一篇示例文章...\n\n## 功能特性\n\n- **现代化设计**：简洁美观的界面\n- **Markdown 编辑**：支持丰富的 Markdown 语法\n- **权限管理**：区分管理员和普通用户\n- **数据安全**：基于 Supabase 的安全保障',
--   '这是一个示例文章，介绍博客的基本功能。',
--   true,
--   true,
--   auth.uid(),
--   '["welcome", "introduction"]'
-- );
