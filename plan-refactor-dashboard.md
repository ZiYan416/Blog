# 计划：用户中心与管理面板重构 (Dashboard Refactoring v2)

## 1. 核心理念 (Core Concept)
响应您的最新指示，我们将 **“个人属性”** 与 **“管理属性”** 在路由层面彻底分离。

-   **/profile (用户中心)**: 无论普通用户还是管理员，作为“网站用户”的个人空间。包含个人资料、我的评论等。管理员也在这里修改自己的个人资料。
-   **/dashboard (管理面板)**: 仅限管理员访问的系统指挥台。包含全站数据、内容管理、系统设置。

## 2. 路由架构重构 (Route Architecture)

| 路径 | 访问权限 | 功能定义 |
| :--- | :--- | :--- |
| **/profile** | 登录用户 (All) | **统一用户中心**。整合原资料设置页，升级为包含概览、互动历史、设置的综合面板。 |
| **/dashboard** | 管理员 (Admin Only) | **纯净管理后台**。移除普通用户视图。非管理员访问将被重定向至 `/profile`。 |

## 3. 详细页面规划

### A. 用户中心 (`/app/profile/page.tsx`)
*目标：从单一的“编辑资料表单”升级为“个人综合面板”。*

**布局结构**: 建议采用 **Tabs (选项卡)** 布局，包含以下标签页：
1.  **概览 (Overview)**:
    -   个人信息卡片（名片背景、头像、昵称和角色、邮箱、个性签名）。
    -   **数据统计**: 我的评论数、活跃天数（从原 Dashboard 迁移）。
    -   **最新动态**: 我最近发表的评论列表。
2.  **设置 (Settings)**:
    -   保留现有的资料编辑功能（头像上传、昵称、个性签名、名片背景选择）。

### B. 管理面板 (`/app/dashboard/page.tsx`)
*目标：打造专业的数据监控与内容管理入口。*

**功能模块**:
1.  **数据指挥舱**:
    -   全站核心指标：文章总数、总阅读量、总评论数、用户总数、管理员总数。
2.  **内容管理入口**:
    -   快捷入口：发布文章、管理文章列表。
    -   **待办提醒**: 待审核评论（如有）、草稿箱中的未完结文章。
3.  **系统状态**:
    -   **数据报表**: 展现阅读量、评论数、用户数、标签使用情况的详细数据报表分析。
    -   热门文章排行榜（可选指标）。

## 4. 迁移与执行步骤

### 第一阶段：路由与权限调整 (Route & Permissions)
1.  **导航栏 (Navbar) 更新**:
    -   修改 `src/components/layout/navbar.tsx`。
    -   **普通用户**: 移除 Dashboard 入口，点击 Avatar 后不再显示下拉菜单，直接转向 "个人中心" (指向 `/profile`)。
    -   **管理员**: Avatar 下拉菜单中同时保留 "管理面板" (指向 `/dashboard`) 和 "个人中心" (指向 `/profile`)。
2.  **Dashboard 权限熔断**:
    -   修改 `src/app/dashboard/page.tsx`。
    -   添加强制重定向逻辑：`if (!isAdmin) redirect('/profile')`。
    -   此时 `/dashboard` 将仅为管理员服务，普通用户无法访问。

### 第二阶段：用户中心重构 (User Center Refactor)
3.  **组件拆分**:
    -   创建 `src/components/profile/profile-settings-form.tsx`: 将原 `src/app/profile/page.tsx` 中的表单逻辑（头像上传、信息修改）剥离为独立组件。
    -   创建 `src/components/profile/profile-overview.tsx`: 新增概览组件，展示个人信息卡片、统计数据（活跃天数、评论数）和最近评论列表。
4.  **Profile 页面重组**:
    -   重写 `src/app/profile/page.tsx`。
    -   引入 Shadcn UI `Tabs` 组件。
    -   实现 "概览" 和 "设置" 两个标签页的切换逻辑。

### 第三阶段：管理面板增强 (Admin Dashboard Upgrade)
5.  **数据层扩展**:
    -   在 `src/app/dashboard/page.tsx` 中扩展数据获取逻辑。
    -   新增查询：用户总数 (`auth.users` 或 `profiles` 表)、管理员数量、待审核评论数。
6.  **UI 模块开发**:
    -   **数据指挥舱**: 更新顶部的统计卡片，加入用户增长数据。
    -   **快捷操作区**: 优化 "发布文章"、"内容管理" 的入口样式。
    -   **系统状态报表**:
        -   创建 `src/components/dashboard/data-reports.tsx`: 详细可视化展示（如展现阅读量、评论数、用户数、标签使用情况的详细数据报表分析、热门文章 Top 5）。
        -   显示待办事项（Drafts, Pending Comments）。
