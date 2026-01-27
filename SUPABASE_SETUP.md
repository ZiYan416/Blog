# Supabase 数据库设置指南

## 步骤 1：创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project" 创建新项目
4. 填写项目信息：
   - **Name**: `my-blog`（或你喜欢的名字）
   - **Database Password**: 设置一个强密码（请妥善保管）
   - **Region**: 选择离你较近的区域（建议选 Hong Kong）
5. 点击 "Create new project"，等待约 2-3 分钟

## 步骤 2：获取项目凭据

1. 创建项目后，进入 "Project Settings"
2. 左侧菜单找到 "API" 选项
3. 复制以下信息：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 步骤 3：执行 SQL 迁移

### 方法 A：通过 Supabase SQL Editor

1. 在 Supabase 项目首页，点击左侧菜单的 "SQL Editor"
2. 点击 "New Query"
3. 将以下文件的内容依次粘贴并执行：

   **[001_initial_schema.sql](./supabase/migrations/001_initial_schema.sql)** - 创建数据库表

   **[002_seed_data.sql](./supabase/migrations/002_seed_data.sql)** - 插入初始数据

   **[003_rls_policies.sql](./supabase/migrations/003_rls_policies.sql)** - 配置 RLS 策略

### 方法 B：通过 Supabase Dashboard

1. 进入项目后，点击左侧菜单的 "SQL Editor"
2. 点击 "New Query"
3. 粘贴并执行 [001_initial_schema.sql](./supabase/migrations/001_initial_schema.sql)
4. 然后分别执行 [002_seed_data.sql](./supabase/migrations/002_seed_data.sql)
5. 最后执行 [003_rls_policies.sql](./supabase/migrations/003_rls_policies.sql)

## 步骤 4：验证数据库

1. 执行完所有 SQL 后，检查 "Table Editor"
2. 应该能看到以下表：
   - `posts` - 博客文章表
   - `tags` - 标签表
   - `featured_posts` - 热门文章表
   - `comments` - 评论表
   - `profiles` - 用户配置表
3. 检查 "Storage" -> "Buckets" 应该有 `blog-images` 存储桶

## 步骤 5：配置环境变量

1. 回到你的本地项目目录
2. 复制环境变量示例文件：
   ```bash
   cp .env.local.example .env.local
   ```
3. 编辑 `.env.local` 文件，填入 Supabase 的 URL 和 key：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
4. 保存文件

## 步骤 6：重启开发服务器

1. 在终端按 `Ctrl + C` 停止当前运行的服务器
2. 重新运行：
   ```bash
   npm run dev
   ```

## 常见问题

### Q: SQL 执行报错 "permission denied"
A: 确保你有足够的权限，尝试以项目所有者身份登录。

### Q: 找不到 auth.users 表
A: 这个表是 Supabase Auth 自动创建的，正常现象。

### Q: 想测试功能但没有登录用户
A: 可以先跳过认证，直接在 Table Editor 手动插入测试数据到 posts 表。

## 下一步

数据库设置完成后，可以继续：
1. 创建登录/注册页面
2. 实现文章 CRUD 功能
3. 集成 Tiptap Markdown 编辑器
