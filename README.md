# My Blog

一个现代化的个人博客系统，使用 Next.js + Supabase 构建。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **托管**: Vercel (前端) + Supabase (后端)

## 功能特性

- ✅ Markdown 编辑器（Tiptap）
- ✅ 用户认证（登录/注册）
- ✅ 文章管理（创建/编辑/删除）
- ✅ 文章发布
- ✅ 标签系统
- ✅ RLS 权限控制
- ✅ 现代化 UI 设计
- ✅ 响应式布局
- ✅ 暗黑模式支持

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，填入 Supabase 的配置信息：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase 数据库设置

详细的设置指南请查看 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

主要步骤：
1. 在 [supabase.com](https://supabase.com) 创建项目
2. 复制项目 URL 和 anon key
3. 在 SQL Editor 中执行迁移文件：
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`
   - `supabase/migrations/003_rls_policies.sql`

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3001](http://localhost:3001) 查看效果。

## 项目结构

```
blog/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── (auth)/            # 需要登录的路由组
│   ├── (public)/           # 公开路由组
│   ├── admin/             # 管理员页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/                # shadcn/ui 组件
│   ├── editor/            # Markdown 编辑器
│   └── post/              # 文章组件
├── lib/
│   ├── supabase/          # Supabase 配置
│   ├── types.ts           # TypeScript 类型
│   └── utils.ts           # 工具函数
├── supabase/
│   └── migrations/        # 数据库迁移
├── PROJECT_STATUS.md      # 项目状态记录
└── SUPABASE_SETUP.md      # Supabase 设置指南
```

## 开发进度

查看 [PROJECT_STATUS.md](./PROJECT_STATUS.md) 了解详细进度。

## 许可证

MIT

## 资源链接

- [Next.js 文档](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase 文档](https://supabase.com/docs)
- [Tiptap 编辑器](https://tiptap.dev/)
