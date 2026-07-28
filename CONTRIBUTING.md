# 贡献指南 (Contributing Guidelines)

感谢你考虑为本项目做出贡献！我们非常欢迎任何形式的贡献，包括发现 bug、修复 bug、添加新特性、完善文档等。

## 如何贡献

### 1. 提交 Issue

在提交代码之前，请先通过提交 [Issue](https://github.com/your-username/your-repo/issues) 的方式与我们讨论你想要添加的特性或发现的 Bug。这样可以避免重复劳动，并确保你的想法与项目方向一致。

### 2. 派生和克隆 (Fork & Clone)

1. 点击右上角的 Fork 按钮，将本项目派生到你的 GitHub 账号下。
2. 将你派生的仓库克隆到本地：

```bash
git clone https://github.com/your-username/your-repo.git
```

### 3. 创建分支 (Create a Branch)

请基于 `master` 分支创建功能分支或 bug 修复分支。分支名应该具有描述性：

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 4. 环境规范

本项目使用以下主要技术栈环境：

- Node.js >= 22.0.0
- npm（以仓库中的 `package-lock.json` 为唯一依赖锁文件）

```bash
npm install
# 配置环境变量 (参考 .env.local.example)
npm run dev
```

### 5. 遵循模块边界

开始编码前请阅读 [项目结构与模块边界](docs/architecture.md)。核心约定如下：

- `src/app` 只负责 Next.js 路由入口、协议适配和页面组合。
- 单一领域的组件、Hook、模型与 Server Actions 放入 `src/features/<domain>`。
- `src/components/ui` 只存放领域无关的基础 UI；跨页面站点外壳放入 `src/components/layout`。
- 仅服务端模块放入 `src/server`，不得依赖路由层、React UI 或客户端 Hook。
- 跨目录导入使用 `@/` 别名，不为旧路径保留无期限的转发文件。

### 6. 运行验证

提交前至少执行：

```bash
npm run lint
npm run typecheck
npm test
git diff --check
```

如果改动路由、构建配置、Server/Client 边界或静态资源加载，还应执行：

```bash
npm run build
```

数据库改动需额外执行 `supabase/` 下的 schema、迁移和 RLS 测试要求，详见 [审计与整改计划](docs/audit-remediation-plan.md)。

### 7. 提交代码 (Commit Changes)

我们推荐使用 [约定式提交 (Conventional Commits)](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 规范来格式化提交信息。

* `feat:` 新功能 (Feature)
* `fix:` 修复 Bug (Bug Fix)
* `docs:` 文档更新 (Documentation)
* `style:` 代码格式 (不影响代码运行的变动，如空格、格式化等)
* `refactor:` 重构 (既不是新增功能，也不是修改 bug 的代码变动)
* `perf:` 性能优化
* `test:` 添加或修改测试用例
* `chore:` 构建过程或辅助工具的变动

示例：
```bash
git commit -m "feat: add tip feature to user profile"
```

### 8. 发起 Pull Request (PR)

1. 将代码推送到你的 GitHub 仓库。
2. 访问主仓库，点击 "New Pull Request"。
3. 按照 PR 模板填写相关描述。
4. 提交后，等待代码审查。

## 代码审查和合并

维护者会尽快审查你的 PR。在审查过程中，我们可能会提出一些修改建议。请根据反馈更新你的分支内容，一旦所有问题解决并且通过测试，你的 PR 将被包含进主分支。

再次感谢你的贡献！🎉
