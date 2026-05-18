# Blog

<div align="center">
  <h3 align="center">A Modern, Minimalist Digital Garden</h3>
  <p align="center">
    用心感受生活的温度，用代码构建数字的花园。
  </p>
  
  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-DB-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat-square&logo=typescript" alt="TypeScript" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License: MIT" /></a>
    <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
  </p>
</div>

---

## 📖 项目简介 (Introduction)

这是一个基于 **Next.js 16 (App Router)** 和 **Supabase** 构建的现代化 个⼈博客系统。

它不仅仅是一个内容管理系统（CMS），更是一个注重阅读体验和视觉美感的数字空间。项目融合了极简主义设计风格、流畅的交互动画以及强大的写作工具，旨在为创作者提供最纯粹的表达平台，为读者提供最舒适的阅读环境。

## ✨ 核心特性 (Features)

### 🎨 极致的视觉体验
- **现代化设计**: 采用 shadcn/ui 组件库，结合 Glassmorphism (毛玻璃) 效果，界面干净、通透。
- **响应式交互**: 完美适配移动端与桌面端，包含优雅的侧滑菜单与手势交互。
- **深色模式**: 完美的系统级深色模式支持，护眼且炫酷。
- **排版美学**: 集成 **Noto Serif SC** (思源宋体)，为标题和文学内容带来印刷品般的阅读质感。
- **流畅动画**: 基于 Framer Motion 的页面转场、开屏动画 (Splash Screen) 和微交互。

### ✍️ 强大的写作系统
- **双模编辑器**: 基于 Tiptap 构建，支持 **所见即所得 (WYSIWYG)** 与 **Markdown 源码** 双向切换。
- **智能辅助**: 支持图片粘贴自动上传、拖拽排序、智能目录生成。
- **内容变现**: 集成了作者个人名片页设置与打赏码配置（支持微信/支付宝打赏）。

### 🛡️ 坚实的技术架构
- **全栈类型安全**: TypeScript + Supabase 生成类型，确保前后端数据链路安全。
- **企业级认证**: 完整的用户认证流程，支持头像上传（自动压缩与清理）、资料管理。
- **高性能**: Next.js 服务端组件 (RSC) + 骨架屏 (Skeleton) 加载策略，秒级响应。
- **SEO 友好**: 自动生成 Sitemap、Robots 配置与 JSON-LD 结构化数据，搜索引擎完美抓取。

## 🛠️ 技术栈 (Tech Stack)

- **框架**: [Next.js 16](https://nextjs.org/) (App Router)
- **语言**: TypeScript
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **组件库**: [shadcn/ui](https://ui.shadcn.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **数据库/认证**: [Supabase](https://supabase.com/) (PostgreSQL)
- **编辑器**: [Tiptap](https://tiptap.dev/)

## 🚀 快速开始 (Quick Start)

### 1. 克隆项目

```bash
git clone https://github.com/ZiYan416/Blog
cd blog
```

### 2. 安装依赖

推荐使用 `npm` 进行依赖管理：

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env.local` 并在其中填入你的 Supabase 配置信息：

```bash
cp .env.example .env.local
```

### 4. 启动开发服务器

```bash
npm run dev
```

现在你可以访问 `http://localhost:3000` 预览项目。

## 🤝 参与贡献 (Contributing)

我们非常欢迎且感谢任何形式的贡献！无论是提交 Issue, 增加 Feature 还是改进文档，所有的工作都有助于让项目变得更好。

参与贡献前，请务必阅读我们的 [贡献指南 (CONTRIBUTING.md)](CONTRIBUTING.md) 了解提交流程。如果你遇到 Bug 或有好的建议，可以参阅对应的模板：
- [报告 Bug](.github/ISSUE_TEMPLATE/bug_report.md)
- [提交需求](.github/ISSUE_TEMPLATE/feature_request.md)

## 📄 开源许可证 (License)

本项目基于 [MIT License](LICENSE) 许可开源。你可以自由地学习、修改和用于任何商业或非商业项目。