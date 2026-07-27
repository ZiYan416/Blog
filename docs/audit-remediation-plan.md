# 博客网站审计与整改计划

> 建立日期：2026-07-27
>
> 适用分支：`feat/foldcraft-theme`
>
> 状态说明：`待处理`、`进行中`、`已完成`、`受阻`

## 目标

本计划用于持续治理当前博客的安全、数据一致性、性能、可访问性、SEO 和工程质量。整改遵循以下原则：

1. 数据库 RLS 是最终权限边界，前端隐藏按钮和路由重定向不视为安全控制。
2. 同一业务数据只保留一个事实来源，跨表写入必须具备原子性或明确的补偿机制。
3. 公开页面优先静态化或缓存，认证和管理功能限制在必要的路由范围内。
4. 每项整改必须有可重复执行的验证方式，不以“本地看起来正常”作为唯一验收标准。
5. 远端数据库只通过前向迁移变更；本地历史 SQL 已审计并压缩为单一权威快照。

## 初始基线

- 技术栈：Next.js 16.1.4、React 19、TypeScript、Supabase、Tailwind CSS 4。
- 源码规模：143 个 TypeScript/TSX/CSS 文件，约 17,017 行。
- 客户端组件：71 个。
- 测试文件：0。
- 静态资源：约 114.71 MiB，其中视频约 113.08 MiB。
- `npx tsc --noEmit`：通过。
- `npm run lint`：失败，82 errors、75 warnings。
- `npm run build`：编译阶段超过 10 分钟未完成，主进程约占用 1.65 GiB 内存。

## 本轮执行结果

执行日期：2026-07-27

- Next.js 已升级到 16.2.12；PostCSS、Sharp 与 brace-expansion 使用已验证的安全版本约束。
- `npm audit --omit=dev` 为 0 vulnerabilities。完整审计仍报告 ESLint 插件链中的 9 个开发期 high 告警（同一 glob DoS 依赖链）；强制升级 ESLint 10 已验证会导致插件运行时不兼容，因此未保留破坏性修复。
- ESLint 从 82 errors、75 warnings 收敛为 0 errors、0 warnings。
- TypeScript 全量检查通过；新增 3 个测试文件、15 个单元测试，全部通过。
- 使用 webpack 后端的生产构建成功，23 个静态页面完成生成。
- 客户端组件由 71 个降为 69 个；删除重复视频后，`public/` 从 114.71 MiB 降至 78.53 MiB。
- 数据库安全修复已通过 Supabase 插件应用到 `my-blog`（项目引用 `hwccjvatbukdtoawjtzx`），远端已登记 5 条前向迁移，最终版本为 `20260727091949`。
- 本地 `00–06` SQL 已审计并合并为唯一权威版本 `supabase/schema.sql`；移除随机分析回填、重复策略、递归评论 RLS、宽松默认授权和冗余索引定义。
- 远端验证确认：7 张业务表均启用 RLS、旧宽松策略计数为 0、`public_profiles` 与私有 profile 数量同步、匿名角色无法读取 `profiles` 或执行管理 RPC。
- Supabase Security Advisor 仅剩有意暴露且含内部鉴权的 RPC 提示，以及项目级“泄露密码保护未启用”；Performance Advisor 仅报告尚无使用统计的索引。
- 当前源码为 146 个文件、约 17,196 行；增长主要来自数据库类型、安全守卫、校验、测试与审计文档。

## P0：安全与权限边界

### P0-1 个人资料与管理员权限

状态：已完成（远端已验证）

问题：

- 普通用户可更新自己的整行 `profiles`，数据库未限制 `is_admin`。
- 普通用户可插入带管理员字段的个人资料。
- `profiles` 对匿名访问公开整行数据，可能暴露邮箱、权限和打赏配置。

整改：

- [x] 移除匿名用户对 `profiles` 的直接读取。
- [x] 创建只包含安全字段、由触发器同步的 `public_profiles` 公开投影表。
- [x] 普通用户只获得个人资料安全字段的列级 UPDATE 权限。
- [x] 管理员角色变更只允许通过受控 RPC 执行。
- [x] 应用公开页面和评论查询迁移到 `public_profiles`。

验收：

- 匿名用户无法读取 `profiles.email` 和 `profiles.is_admin`。
- 普通用户无法将自己的 `is_admin` 改为 `true`。
- 管理员仍可查看用户列表并调整其他用户权限。

### P0-2 评论审核与回复

状态：已完成（远端已验证）

问题：

- 普通用户可以绕过应用层直接插入 `approved=true` 的评论。
- 回复计数触发器以调用者权限更新父评论，可能被 RLS 拒绝。
- 未验证父评论是否属于同一篇文章。

整改：

- [x] 在 INSERT RLS 中强制普通用户只能提交未审核评论。
- [x] 通过非公开 `private` 校验函数验证父评论已审核且属于同一篇文章，避免同表 RLS 递归。
- [x] 使用固定 `search_path` 的受控触发器原子维护已审核回复数量。

验收：

- 普通用户直接提交 `approved=true` 被数据库拒绝。
- 普通用户可正常提交待审核回复。
- 跨文章回复被数据库拒绝。

### P0-3 标签关系

状态：进行中

问题：任意登录用户都可修改任意文章的 `post_tags`。

整改：

- [x] 将 `post_tags` 写权限收紧为管理员。
- [ ] 后续移除 `posts.tags` JSON 双写，以 `post_tags` 为唯一事实来源。

### P0-4 高权限函数与上传

状态：已完成（远端已验证）

整改：

- [x] 所有本轮涉及的 `SECURITY DEFINER` 函数固定 `search_path`。
- [x] 显式撤销 PUBLIC 执行权限并按角色重新授权。
- [x] 将头像和文章图片 bucket、大小、MIME 类型及对象所有权策略纳入迁移。

## P1：正确性与架构

### P1-1 浏览计数

状态：已完成

- [x] 改为数据库原子递增 RPC。
- [x] 移除每次浏览触发的整页 `revalidatePath`。
- [x] 按浏览器会话去重；长期仍可迁移到独立分析事件表。

### P1-2 服务端鉴权与输入校验

状态：已完成

- [x] 提供统一的 `requireUser`、`requireAdmin` 服务端守卫。
- [x] 统一文章创建、更新、删除在 API、Server Action 与 RLS 中的权限语义。
- [x] 为文章、评论和分页参数增加 Zod 运行时 schema；认证改用 Supabase 官方流程，不再维护重复 API。
- [x] 将分页限制在安全范围内，拒绝非法页码和排序值。
- [x] 避免将用户输入直接拼接进 PostgREST 过滤表达式。

### P1-3 文章与标签事务

状态：进行中

- [x] 新建和更新文章改为单个事务型 RPC。
- [x] 在单个数据库调用中同步标签，消除应用层逐标签 N+1 往返。
- [ ] 移除 `posts.tags` JSON 的读取与写入依赖。

### P1-4 数据库与分析

状态：进行中

- [x] 新鲜安装不再生成随机历史分析数据。
- [ ] 评估并清理现有环境中的虚假快照，不自动删除无法确认来源的数据。
- [x] 为公开文章排序与评论列表补充部分索引。
- [ ] 根据实际查询计划决定全文搜索 GIN 索引。

## P1：性能与用户体验

### P1-5 Proxy 与缓存

状态：进行中

- [x] Proxy 排除 API、静态图片、字体与视频等资源。
- [x] 静态图片、字体、视频不经过 Supabase 鉴权。
- [ ] 将公开站点与认证/管理布局拆分，恢复公开页面缓存能力。
- [ ] 消除文章元数据和正文的重复查询，并行获取作者与评论。

### P1-6 首页媒体

状态：进行中

- [x] 删除两个哈希一致的重复视频文件，减少约 36.19 MiB。
- [ ] 生成低码率移动端版本和 WebM/AV1 版本。
- [ ] 为所有视频补充专用 poster。
- [x] 增加 `prefers-reduced-motion` 和 `saveData` 降级。
- [x] 仅预载当前主题的视频组，不再同时预载全部高清视频。
- [ ] 评估将视频迁移到 CDN/对象存储。

### P1-7 图片与动画

状态：进行中

- [x] 配置可信 Next Image 远端来源并替换全部业务 `<img>`；任意用户 URL 使用安全直通加载器。
- [x] 移除固定 800ms 的强制 Splash Screen。
- [ ] 继续覆盖尚未审计的所有循环动画；页面模板与首屏视频已支持 `prefers-reduced-motion`。

## P2：结构与可维护性

### P2-1 模块拆分

状态：进行中

- [ ] 将 `editor.tsx`、资料设置表单、文章列表等超大组件拆分。
- [ ] 合并新建/编辑文章页的表单、上传和标签逻辑。
- [ ] 按 `features/`、`server/`、`db/` 重组业务代码。

目标结构：

```text
src/
  features/
    auth/
    posts/
    comments/
    profile/
    analytics/
  server/
    auth/
    repositories/
    services/
  db/
    database.types.ts
  components/
    ui/
```

### P2-2 类型、死代码与依赖

状态：已完成

- [x] 接入覆盖当前 schema 的 Supabase 数据库类型；后续应改为 CI 自动生成。
- [x] 消除业务数据流中的显式 `any` 和 `@ts-ignore`。
- [x] 合并重复的 `cn()`。
- [x] 删除未使用的 Markdown 渲染链路、重复认证 API 和测试 API。
- [x] 清理未使用的直接依赖。

### P2-3 测试与 CI

状态：进行中

- [x] 增加校验、鉴权与 Markdown 工具的 15 个单元测试。
- [ ] 增加关键组件测试。
- [ ] 增加文章发布、评论审核、权限切换的端到端测试。
- [ ] 增加数据库 RLS 集成测试。
- [ ] CI 必须执行 lint、类型检查、测试和生产构建。

## P2：SEO、可访问性与文档

状态：进行中

- [x] 根页面语言改为 `zh-CN`。
- [x] 允许用户缩放页面。
- [x] 增加 `metadataBase`、canonical 和统一站点配置。
- [x] 统一 robots 与 sitemap 的域名来源。
- [x] sitemap 覆盖静态页、文章与标签，并使用 Next Metadata API 生成。
- [ ] 搜索框、移动菜单和自定义交互补充可访问名称。
- [x] README、CONTRIBUTING 与 `package.json#engines` 的 Node 要求更新为 `>=20.19.0`。
- [x] 三种语言 README 使用实际存在的 `.env.local.example`。

## 每批变更的验证清单

```bash
git diff --check
npx tsc --noEmit
npm run lint
npm test
npm run build
```

数据库变更还需要：

- 在临时 Supabase 分支完整执行 `supabase/schema.sql`，作为全新安装验证。
- 已完成远端结构、RLS、表/列权限、函数执行权、存储策略和迁移记录的只读验证。
- 已完成 Supabase Security Advisor 与 Performance Advisor 复查。

## 不自动执行的操作

- 不自动删除无法确认来源的生产分析数据。
- 不移动根目录的 README、CONTRIBUTING、LICENSE；它们属于仓库入口文件。
