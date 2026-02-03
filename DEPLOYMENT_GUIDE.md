# 全栈博客项目上线部署指南 (Next.js + Supabase + Vercel + Cloudflare)

这份文档将手把手教你如何将我们开发的博客项目从本地发布到互联网上。即使你没有任何经验，只要按照步骤操作即可完成。

---

## 目录

1.  **准备工作**：代码推送与环境检查
2.  **后端部署**：Supabase 生产环境配置
3.  **前端部署**：Vercel 基础部署
4.  **域名购买**：Spaceship 操作指南
5.  **DNS 解析**：接入 Cloudflare
6.  **域名绑定**：Vercel 与 Cloudflare 的连接
7.  **生产环境修正**：修复登录与鉴权
8.  **SEO 与分析**：接入 Google Analytics (GA4)
9.  **支付准备**：Stripe 账户配置 (预备)

---

## 第一阶段：准备工作 (GitHub)

Vercel 会自动从 GitHub 拉取代码进行部署，所以首先确保你的代码已经提交。

1.  **检查代码**：确保本地运行无误。
2.  **提交代码到 GitHub**：
    *   打开 VSCode 源代码管理面板（左侧分支图标）。
    *   输入提交信息（如 "Ready for deployment"）。
    *   点击 **Commit (提交)**。
    *   点击 **Sync Changes (同步更改)** 或 **Push (推送)**。
    *   *确认你的 GitHub 仓库中有最新的代码。*

---

## 第二阶段：后端部署 (Supabase)

虽然我们本地开发已经用了 Supabase，但为了稳定，通常建议检查一下生产环境设置（本项目较小，我们可以直接复用现有的 Supabase 项目，也可以新建一个专门用于生产环境的项目，这里以**复用现有项目**为例）。

1.  **登录 Supabase 面板**：访问 [supabase.com](https://supabase.com/dashboard/projects)。
2.  **获取环境变量**：
    *   进入你的项目。
    *   点击左下角 **Project Settings (齿轮图标)** -> **API**。
    *   记下 `Project URL` (URL) 和 `anon public` (Key)。这两个稍后在 Vercel 中要用。
3.  **配置 Auth (鉴权)**：
    *   点击左侧 **Authentication** -> **URL Configuration**。
    *   **Site URL**：暂时保持 `http://localhost:3000`，等我们在 Vercel 部署拿到正式域名后，需要回来修改这里。
    *   **Redirect URLs**：确保包含 `http://localhost:3000/**`。稍后我们会添加生产环境的 URL。

---

## 第三阶段：前端部署 (Vercel)

Vercel 是 Next.js 的官方部署平台，体验极佳。

1.  **注册/登录 Vercel**：
    *   访问 [vercel.com](https://vercel.com)。
    *   选择 **Continue with GitHub** 登录。
2.  **导入项目**：
    *   在 Dashboard 点击 **Add New ...** -> **Project**。
    *   在 "Import Git Repository" 列表中找到你的博客项目仓库，点击 **Import**。
3.  **配置项目**：
    *   **Project Name**：可以保持默认，也可以改个好听的名字（如 `my-super-blog`）。
    *   **Framework Preset**：Vercel 会自动识别为 Next.js，不用动。
    *   **Root Directory**：默认 `./`，不用动。
    *   **Environment Variables (关键步骤)**：
        *   我们需要把本地 `.env.local` 里的变量填进去。
        *   展开这一项，逐个添加：
            *   Key: `NEXT_PUBLIC_SUPABASE_URL` | Value: (粘贴 Supabase 的 Project URL)
            *   Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Value: (粘贴 Supabase 的 anon public Key)
            *   Key: `NEXT_PUBLIC_SITE_URL` | Value: (暂时先不填，或者填 Vercel 分配的临时域名，我们稍后有了正式域名再来加)
4.  **点击 Deploy**：
    *   Vercel 会开始构建项目。等待约 1-2 分钟。
    *   如果构建成功，你会看到满屏的撒花庆祝。
    *   点击预览图，你会获得一个 `https://your-project.vercel.app` 的临时域名。
    *   **测试**：此时访问这个临时域名，页面应该能打开，但**登录功能可能会报错**，因为 Supabase 还不认识这个新域名。

---

## 第四阶段：域名购买 (Spaceship)

Spaceship 是 Namecheap 旗下的新域名注册商，价格便宜且界面现代。

1.  访问 [spaceship.com](https://www.spaceship.com/) 并注册账号。
2.  **搜索域名**：在搜索框输入你想要的域名（例如 `my-blog-demo.com`）。
3.  **购买**：
    *   选择你心仪的后缀（推荐 .com, .net, .io, .me）。
    *   加入购物车 (Add to Cart) -> Checkout。
    *   **注意**：不需要购买额外的 Hosting 或 Email 服务，只买域名 (Domain Registration) 即可。
    *   WHOIS Privacy (隐私保护) 通常是免费赠送且默认开启的，一定要保留。
4.  完成支付。

---

## 第五阶段：DNS 解析 (Cloudflare)

我们将使用 Cloudflare (CF) 来管理 DNS，因为它提供免费的全球 CDN、安全防护（防 DDoS）和极快的解析速度。

1.  **注册 Cloudflare**：访问 [dash.cloudflare.com](https://dash.cloudflare.com/sign-up) 注册。
2.  **添加站点**：
    *   点击 **Add a site**。
    *   输入你在 Spaceship 刚买的域名（如 `my-blog-demo.com`）。
    *   选择 **Free (免费版)** 计划，点击 Continue。
3.  **扫描记录**：CF 会扫描你当前的 DNS 记录，点击 Continue 即可。
4.  **修改 Nameservers (名称服务器)**：
    *   CF 会给你两个服务器地址，类似 `bob.ns.cloudflare.com` 和 `lola.ns.cloudflare.com`。
    *   **回到 Spaceship 后台**：
        *   找到你的域名列表，点击 **Manage**。
        *   找到 **DNS / Nameservers** 设置。
        *   将默认的 "Spaceship DNS" 修改为 "Custom DNS"。
        *   填入 Cloudflare 给你的那两个地址。
        *   保存 (Save)。
5.  **回到 Cloudflare**：点击 "Check nameservers"。这可能需要几分钟到几小时生效（通常 15 分钟左右）。当你在 CF 首页看到域名变成 "Active" 绿色状态时，说明接管成功。

---

## 第六阶段：域名绑定 (Vercel + Cloudflare)

这是最关键的一步，我们要让访问 `your-domain.com` 的流量指向 Vercel。

1.  **在 Vercel 中添加域名**：
    *   进入 Vercel 项目 -> **Settings** -> **Domains**。
    *   输入你的域名（如 `my-blog-demo.com`），点击 Add。
    *   选择推荐选项（通常是添加 `my-blog-demo.com` 和 `www.my-blog-demo.com`）。
2.  **获取 DNS 记录**：
    *   Vercel 会提示配置错误 (Invalid Configuration)，并给出需要的记录值。
    *   通常通过 **A 记录** 和 **CNAME 记录** 两种方式：
        *   **Type**: `A` | **Name**: `@` (即根域名) | **Value**: `76.76.21.21` (这是 Vercel 的固定 IP)
        *   **Type**: `CNAME` | **Name**: `www` | **Value**: `cname.vercel-dns.com`
3.  **在 Cloudflare 中添加记录**：
    *   进入 Cloudflare -> 你的域名 -> **DNS** -> **Records**。
    *   如果里面有旧的记录，可以先删除（除了 MX 邮件记录）。
    *   **添加 A 记录**：
        *   Type: `A`
        *   Name: `@`
        *   Content: `76.76.21.21`
        *   Proxy status: **关闭代理 (DNS Only / 灰色云朵)**。
            *   *注意*：初次配置建议先用灰色云朵，确保 Vercel 能成功颁发 SSL 证书。等 Vercel 显示全绿后，你再开启橙色云朵（Proxied），但在开启橙色云朵前，必须在 Cloudflare 的 **SSL/TLS** 设置中将模式改为 **Full (Strict)**，否则会无限重定向循环。
    *   **添加 CNAME 记录**：
        *   Type: `CNAME`
        *   Name: `www`
        *   Content: `cname.vercel-dns.com`
        *   Proxy status: 同上，先关闭 (DNS Only)。
4.  **等待生效**：回到 Vercel Domains 页面，刷新。当两个勾都变绿，说明域名配置成功！

---

## 第七阶段：生产环境修正 (Supabase & Vercel)

域名通了，但登录功能还需要更新配置。

1.  **更新 Supabase URL**：
    *   回到 Supabase -> Authentication -> URL Configuration。
    *   **Site URL**：修改为你的正式域名 `https://my-blog-demo.com`。
    *   **Redirect URLs**：添加 `https://my-blog-demo.com/**`。
    *   保存。
2.  **更新 Vercel 环境变量**：
    *   回到 Vercel -> Settings -> Environment Variables。
    *   添加/修改 `NEXT_PUBLIC_SITE_URL`，值为 `https://my-blog-demo.com`。
    *   **重新部署**：修改环境变量后，必须重新部署才生效。去 **Deployments** 页面，找到最新的部署，点击右侧三个点 -> **Redeploy**。

---

## 第八阶段：SEO 与 Google Analytics (GA4)

1.  **创建 GA4 账号**：
    *   访问 [analytics.google.com](https://analytics.google.com/)。
    *   创建账号 -> 创建媒体资源 (Property)。
    *   平台选择 "Web"。
    *   输入网址 `https://my-blog-demo.com`。
    *   创建后，你会得到一个 **Measurement ID (衡量 ID)**，格式如 `G-XXXXXXXXXX`。
2.  **在代码中接入 GA**：
    *   我们需要在项目中安装一个轻量级的 GA 库，或者直接插入脚本。推荐使用官方推荐的 `@next/third-parties` 库。
    *   **现在回到你的本地 VSCode**。
    *   运行命令：`npm install @next/third-parties`
    *   修改 `src/app/layout.tsx`：
        ```typescript
        import { GoogleAnalytics } from '@next/third-parties/google'

        export default function RootLayout({ children }) {
          return (
            <html lang="en">
              <body>{children}</body>
              {/* 替换下面的 ID 为你的 G-开头 ID */}
              <GoogleAnalytics gaId="G-XYZ123456" />
            </html>
          )
        }
        ```
    *   **或者（更简单的免代码方式 - 仅限 Vercel Pro，免费版推荐代码方式）**：Vercel 集成了 Analytics 面板，但 GA 更通用。
    *   **环境变量方式（推荐）**：
        *   在代码里写：`<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />`
        *   在 Vercel 环境变量里填 `NEXT_PUBLIC_GA_ID` = `G-XXXXXXXXXX`。
        *   这样不用把 ID 硬编码在代码里。
3.  **提交代码并推送**：Vercel 会自动重新部署并生效。

---

## 第九阶段：支付准备 (Stripe)

虽然我们代码还没写支付逻辑，但可以先把 Key 准备好。

1.  **注册 Stripe**：访问 [stripe.com](https://stripe.com)。
2.  **获取 API Keys**：
    *   注册并激活账号（测试模式不需要激活公司信息，可以直接用）。
    *   在 Dashboard 右上角开启 **Test Mode (测试模式)**。
    *   点击 **Developers** -> **API keys**。
    *   你会看到 `Publishable key` (pk_test_...) 和 `Secret key` (sk_test_...)。
3.  **配置到 Vercel**：
    *   在 Vercel 环境变量中添加：
        *   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: 填入 pk_test_...
        *   `STRIPE_SECRET_KEY`: 填入 sk_test_...
4.  **后续开发**：以后开发支付功能时，代码直接读取这两个变量即可。

---

## 总结 Checklist

- [ ] 代码 Push 到 GitHub。
- [ ] Supabase 获取了 Key 和 URL。
- [ ] Vercel 导入项目并配置了 Supabase 环境变量。
- [ ] Spaceship 购买了域名。
- [ ] Cloudflare 接管了 DNS (修改了 NS)。
- [ ] Vercel 添加了域名，获得了 A/CNAME 记录值。
- [ ] Cloudflare 添加了 A/CNAME 记录 (先灰色云朵)。
- [ ] Supabase 更新了 Site URL 为正式域名。
- [ ] GA4 ID 配置到了代码/环境变量中。
- [ ] Vercel 触发了最后一次 Redeploy。

祝贺你！完成以上步骤，你的个人博客就已经正式面向全球用户上线了！

---

## 附录：针对中国内地访问的特别优化 (免费方案)

由于特殊的网络环境，部署在海外服务器（如 Vercel）的网站在中国内地访问可能会遇到速度慢或阻断的问题。以下是我们在本项目中已经实施或建议的优化措施：

### 1. 代码层面优化 (已完成)
*   **移除 Google Fonts**：Google 字体服务在国内访问极其不稳定，是导致白屏的主要原因。本项目已修改 `layout.tsx`，移除了 `next/font/google`，改用系统默认字体 (System Fonts)。这不仅解决了加载阻塞问题，还实现了 **0ms** 的字体加载速度。
*   **精简第三方脚本**：尽量避免在 `<head>` 中引入未经优化的国外统计脚本。

### 2. 域名解析策略 (关键)
*   **必须使用独立域名**：Vercel 默认分配的 `*.vercel.app` 域名在国内被严重干扰，几乎无法访问。绑定自定义域名（如 `yourname.com`）是让网站在国内可访问的**最基本前提**。
*   **Cloudflare 设置建议**：
    *   我们在指南中使用了 Cloudflare 进行 DNS 管理。
    *   **小技巧**：如果发现开启 Cloudflare 代理（橙色云朵）后国内访问速度不佳（Cloudflare 免费版节点通常在美国），可以尝试将其改为 **仅 DNS (灰色云朵)**。这会让流量直接流向 Vercel 的全球 Anycast 网络，在某些网络环境下（特别是电信）可能比经过 Cloudflare 转发更快。

### 3. 图片资源
*   Supabase 的存储服务基于 AWS，速度尚可。如果未来需要极致速度，建议使用国内的对象存储（阿里云 OSS / 腾讯云 COS）配合 CDN，或者使用 ImageKit 等带有全球节点的免费 CDN 服务。
