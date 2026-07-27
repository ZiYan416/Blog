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

请基于 `main` 分支创建功能分支或 bug 修复分支。分支名应该具有描述性：

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 4. 环境规范

本项目使用以下主要技术栈环境：
- Node.js >= 20.19.0
- npm / pnpm / yarn / bun (推荐 npm 或 pnpm)

```bash
npm install
# 配置环境变量 (参考 .env.local.example)
npm run dev
```

### 5. 提交代码 (Commit Changes)

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

### 6. 发起 Pull Request (PR)

1. 将代码推送到你的 GitHub 仓库。
2. 访问主仓库，点击 "New Pull Request"。
3. 按照 PR 模板填写相关描述。
4. 提交后，等待代码审查。

## 代码审查和合并

维护者会尽快审查你的 PR。在审查过程中，我们可能会提出一些修改建议。请根据反馈更新你的分支内容，一旦所有问题解决并且通过测试，你的 PR 将被包含进主分支。

再次感谢你的贡献！🎉
