# 项目结构与模块边界

本文定义仓库的目录职责、依赖方向和新增代码放置规则。目录结构发生变化时，应在同一个 Pull Request 中同步更新本文。

## 目录职责

```text
.
├─ src/
│  ├─ app/                 # Next.js App Router：路由入口、页面、布局和 Route Handlers
│  ├─ components/
│  │  ├─ layout/           # 跨页面的站点外壳，如导航、页脚和加载器
│  │  └─ ui/               # 领域无关的基础 UI 组件
│  ├─ features/
│  │  ├─ admin/            # 后台管理与分析
│  │  ├─ auth/             # 登录、会话、认证组件与 Server Actions
│  │  ├─ comments/         # 评论业务
│  │  ├─ home/             # 首页专属展示
│  │  ├─ posts/            # 文章、编辑器、列表与文章 Server Actions
│  │  ├─ profile/          # 个人资料
│  │  ├─ settings/         # 客户端偏好设置
│  │  └─ tags/             # 标签管理与 Server Actions
│  ├─ server/              # 仅服务端使用的缓存、鉴权、仓储和服务
│  ├─ db/                  # 数据库生成类型和数据库边界
│  ├─ hooks/               # 可跨领域复用的客户端 Hook
│  ├─ lib/                 # 领域无关的工具、校验、配置和客户端工厂
│  └─ types/               # 第三方类型补充
├─ tests/                  # Vitest 与 Playwright 测试
├─ supabase/               # 权威 schema、前向迁移和数据库测试
├─ public/                 # 直接发布的静态资源
├─ scripts/                # 一次性或维护型脚本
└─ docs/                   # 架构、审计和运维文档
```

`src/app` 负责协议适配和页面组合，不作为通用业务模块目录。可复用的业务实现必须进入对应的 `src/features/<domain>`。

Next.js、TypeScript、ESLint、PostCSS、Tailwind 和测试工具的项目级配置统一放在仓库根目录，不混入 `src`。

## 依赖方向

允许的主要依赖方向如下：

```text
app ───────────────→ features ─────────→ components/ui
 │                       │                    │
 ├─→ components/layout   ├─→ hooks           └─→ lib
 ├─→ server              ├─→ lib
 └─→ lib                 └─→ server（仅 Server Action/服务端模块）

server ─────────────→ db / lib / feature model
```

边界规则：

1. `components/ui` 不得依赖 `app`、`features` 或 `server`；基础 UI 不包含业务请求和领域状态。
2. `features` 不得反向依赖 `app`。Server Actions、领域 Hook、领域类型和业务组件都放在 feature 内。
3. `server` 不得依赖路由、React UI 或客户端 Hook。
4. `app` 可以组合 feature、布局和服务端查询，但页面间不得通过相对路径互相引用。
5. 跨目录导入统一使用 `@/` 别名；同一小模块内可使用相对导入。

上述前三条由 ESLint 的 `no-restricted-imports` 规则检查。规则暂未覆盖的边界仍应在代码审查中执行。

## 文件放置决策

新增文件前按顺序判断：

1. 是否是 Next.js 约定文件或 HTTP 入口？放入 `src/app`。
2. 是否只服务于一个业务领域？放入 `src/features/<domain>`。
3. 是否是跨页面站点外壳？放入 `src/components/layout`。
4. 是否是不含业务语义的基础 UI？放入 `src/components/ui`。
5. 是否只能在服务端运行？放入 `src/server`，或放在 feature 内并使用 `server-only`/`use server` 明确边界。
6. 是否是无领域语义的通用工具或 Hook？分别放入 `src/lib` 或 `src/hooks`。

不要为了单个文件预建空目录，也不要通过转发导出文件长期保留旧路径。迁移时应一次性更新调用方并删除空目录。

## 命名与组织

- 普通 TypeScript/React 文件使用 `kebab-case`；Next.js 约定文件保持 `page.tsx`、`layout.tsx`、`route.ts` 等名称。
- React 组件和类型使用 `PascalCase`，函数、Hook 和变量使用 `camelCase`。
- 每个 feature 按需使用 `components/`、`hooks/`、`editor/` 等子目录；只有一个文件时不强制建立子目录。
- 领域模型放在 feature 的 `model.ts` 或明确命名的类型文件中，避免仅为兼容旧路径创建类型转发层。
- `src/db/database.types.ts` 视为生成边界；数据库结构变化后应同步生成或更新。

## 变更检查

涉及结构或模块边界的变更至少运行：

```bash
npm run lint
npm run typecheck
npm test
git diff --check
```

改动路由、构建配置、Server/Client 边界或静态资源加载时，再运行：

```bash
npm run build
```

页面加载、Markdown 服务端化、slug 服务端边界和客户端分块的详细约束见 [页面加载性能与服务端边界](performance.md)。

数据库改动还必须遵循 [审计与整改计划](audit-remediation-plan.md) 中的 Supabase 验证要求。
