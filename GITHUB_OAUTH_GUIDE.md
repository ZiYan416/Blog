# GitHub OAuth 配置指南

为了实现“使用 GitHub 登录”功能，您需要在 GitHub 上创建一个 OAuth 应用，并将凭证配置到 Supabase 项目中。

## 第一步：创建 GitHub OAuth App

1. 登录您的 GitHub 账号。
2. 访问 [Developer settings](https://github.com/settings/developers) (设置 -> Developer settings)。
3. 点击左侧菜单的 **OAuth Apps**。
4. 点击右上角的 **New OAuth App** 按钮。

## 第二步：填写应用信息

请按以下格式填写表单：

- **Application name**: `My Blog` (或您喜欢的任何名称)
- **Homepage URL**: `http://localhost:3000` (本地开发) 或 您的线上域名
- **Application description**: (可选)
- **Authorization callback URL**:
  - 这是最重要的一步。您需要从 Supabase 获取此 URL。
  - 通常格式为: `https://<你的-project-ref>.supabase.co/auth/v1/callback`

### 如何获取 Authorization callback URL?
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)。
2. 进入您的项目。
3. 点击左侧菜单的 **Authentication** -> **Providers**。
4. 找到 **GitHub** 并点击展开（如果是未启用状态，点击 Enable）。
5. 您会在顶部看到 **Callback URL (for OAuth)**，点击复制即可。

## 第三步：获取 Client ID 和 Client Secret

1. 点击 **Register application** 创建应用。
2. 创建成功后，您会看到 **Client ID**，请复制它。
3. 点击 **Generate a new client secret** 生成密钥，请复制它（注意：密钥只显示一次）。

## 第四步：配置 Supabase

1. 回到 Supabase Dashboard -> Authentication -> Providers -> GitHub。
2. 开启 **Enable GitHub** 开关。
3. 将刚才复制的 **Client ID** 填入 `Client ID` 框。
4. 将刚才复制的 **Client Secret** 填入 `Client Secret` 框。
5. 点击 **Save** 保存配置。

## 第五步：本地环境测试

确保您的代码中登录逻辑正确调用了 GitHub 提供商：

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

现在，点击登录窗口中的“使用 GitHub 继续”按钮，应该可以正常跳转并登录了。

---

### 注意事项

- **生产环境**: 当您将网站部署到 Vercel 等平台后，不要忘记：
  1. 在 GitHub OAuth App 中更新 **Homepage URL** 为您的线上域名。
  2. 在 Supabase Dashboard -> Authentication -> URL Configuration -> **Site URL** 和 **Redirect URLs** 中添加您的线上域名。
