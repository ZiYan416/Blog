# Blog (Next.js 16 + Supabase)

<div align="center">
  <h3 align="center">A Modern, Minimalist Digital Garden</h3>
  <p align="center">
    用心感受生活的温度，用代码构建数字的花园。
  </p>
</div>

---

## 📖 项目简介

这是一个基于 **Next.js 16 (App Router)** 和 **Supabase** 构建的现代化个人博客系统。

它不仅仅是一个内容管理系统（CMS），更是一个注重阅读体验和视觉美感的数字空间。项目融合了极简主义设计风格、流畅的交互动画以及强大的写作工具，旨在为创作者提供最纯粹的表达平台，为读者提供最舒适的阅读环境。

## ✨ 核心特性

### 🎨 极致的视觉体验
- **现代化设计**: 采用 shadcn/ui 组件库，结合 Glassmorphism (毛玻璃) 效果，界面干净、通透。
- **响应式交互**: 完美适配移动端与桌面端，包含优雅的侧滑菜单与手势交互。
- **深色模式**: 完美的系统级深色模式支持，护眼且炫酷。
- **排版美学**: 集成 **Noto Serif SC** (思源宋体)，为标题和文学内容带来印刷品般的阅读质感。
- **流畅动画**: 基于 Framer Motion 的页面转场、开屏动画 (Splash Screen) 和微交互。

### ✍️ 强大的写作系统
- **双模编辑器**: 基于 Tiptap 构建，支持 **所见即所得 (WYSIWYG)** 与 **Markdown 源码** 双向切换。
- **智能辅助**: 支持图片粘贴自动上传、拖拽排序、智能目录生成。
- **每日一言**: 首页集成了带有“智能分行算法”的每日一言组件，呈现生活中的灵感火花。

### 🛡️ 坚实的技术架构
- **全栈类型安全**: TypeScript + Supabase 生成类型，确保前后端数据链路安全。
- **企业级认证**: 完整的用户认证流程，支持头像上传（自动压缩与清理）、资料管理。
- **高性能**: Next.js 服务端组件 (RSC) + 骨架屏 (Skeleton) 加载策略，秒级响应。

## 🛠️ 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) (App Router)
- **语言**: TypeScript
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **组件库**: [shadcn/ui](https://ui.shadcn.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **数据库/认证**: [Supabase](https://supabase.com/) (PostgreSQL)
- **编辑器**: [Tiptap](https://tiptap.dev/)
- **图标**: Lucide React

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/blog.git
cd blog
```

### 2. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 3. 环境配置

复制环境变量示例文件：

```bash
cp .env.local.example .env.local
```

在 `.env.local` 中填入你的 Supabase 项目凭证：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 数据库初始化

本项目依赖 Supabase。请在 Supabase SQL Editor 中依次运行 `supabase/migrations/` 目录下的 SQL 文件：

1. `001_initial_schema.sql` - 创建表结构
2. `002_seed_data.sql` - 写入初始测试数据
3. `003_rls_policies.sql` - 配置安全策略 (RLS)

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可看到运行效果。

## 📂 项目结构

```
src/
├── app/                 # Next.js App Router 路由
│   ├── (auth)/          # 认证相关页面 (登录/注册)
│   ├── admin/           # 后台管理页面
│   ├── api/             # API 路由
│   ├── post/            # 文章详情页
│   └── layout.tsx       # 全局布局 (包含 Font, AuthProvider)
├── components/
│   ├── auth/            # 认证组件
│   ├── editor/          # Tiptap 编辑器组件
│   ├── home/            # 首页特定组件 (DailyQuote)
│   ├── layout/          # 布局组件 (Navbar, Footer, Splash)
│   └── ui/              # 通用 UI 组件 (Button, Card, etc.)
├── lib/                 # 工具函数与配置
│   ├── supabase/        # Supabase 客户端初始化
│   └── utils.ts         # 通用工具
├── hooks/               # 自定义 React Hooks
└── styles/              # 全局样式
```

## 📝 许可证

本项目采用 MIT 许可证。
