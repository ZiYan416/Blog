# 中国内地访问深度优化指南 (2025版)

本指南专为解决 Next.js + Supabase 项目在中国大陆网络环境下的访问速度与稳定性问题。

---

## 核心痛点分析

在默认情况下，您的博客可能会遇到以下问题：
1.  **无法访问**: `*.vercel.app` 域名被 DNS 污染，导致无法解析。
2.  **白屏卡顿**: Google Fonts (字体)、GTM (谷歌统计) 等资源连接超时，阻塞页面渲染。
3.  **图片加载慢**: Supabase 的存储位于 AWS (新加坡/美国)，直连速度受限。

---

## 方案一：Vercel 优化流 (推荐初学者)

这是基于您当前架构（Vercel）的优化方案，成本为零，只需要正确配置。

### 1. 域名与 DNS 策略 (生死攸关)

*   **必须绑定独立域名**: 绝对不要把 `vercel.app` 的链接发给国内用户。
*   **DNS 解析商**: 推荐 **Cloudflare** 或 **DNSPod (腾讯云)**。
    *   *Cloudflare*: 国际通用，免费抗攻击。
    *   *DNSPod*: 国内解析速度略快，但对 Vercel 的 SSL 证书签发支持不如 CF 顺滑。

### 2. Cloudflare 最佳配置 (关键技巧)

很多人配置了 Cloudflare 但速度依然很慢，因为走的是美国节点。请按以下“三步走”策略调整：

1.  **添加 A 记录**:
    *   Type: `A`
    *   Name: `@`
    *   Content: `76.76.21.21` (Vercel 官方 Anycast IP)
    *   **Proxy Status**: **DNS Only (灰色云朵)** <--- **极重要**

2.  **添加 CNAME 记录**:
    *   Type: `CNAME`
    *   Name: `www`
    *   Content: `cname.vercel-dns.com`
    *   **Proxy Status**: **DNS Only (灰色云朵)**

3.  **为什么不开代理 (橙色云朵)?**
    *   开启橙色云朵意味着流量先去 Cloudflare (通常是美国节点) 再回源。
    *   关闭橙色云朵 (DNS Only) 让国内用户**直连** Vercel 的全球加速节点 (通常会自动分配到新加坡或日本节点)，对于电信/联通用户来说，这往往比绕道美国快得多。

---

## 方案二：Netlify (Vercel 的最佳替补)

如果 Vercel 在您所在的地区完全无法连接，**Netlify** 是最稳妥的备选方案。

*   **费用**: 免费 (Free Tier 足够个人使用)。
*   **优势**:
    *   部署流程与 Vercel 几乎一样简单（导入 GitHub 仓库即可）。
    *   会自动识别 Next.js 并安装适配器 (`@netlify/plugin-nextjs`)。
    *   它的 IP 路由策略与 Vercel 不同，有时在某些地区（如移动宽带）Vercel 连不上，Netlify 却能连上。
*   **缺点**:
    *   默认域名 `*.netlify.app` 在国内同样面临被 DNS 污染的风险（虽然比 `vercel.app` 稍好一点点）。
    *   **结论**: 依然建议绑定独立域名以获得稳定访问。

---

## 方案三：Cloudflare Pages (技术流推荐 - 速度最快)

Cloudflare Pages 是目前理论上国内访问速度最快的免费方案，因为它直接运行在 Cloudflare 的边缘节点上。

*   **费用**: 完全免费。
*   **优势**:
    *   **速度**: 真正的边缘计算 (Edge)，没有冷启动，全球节点响应极快。
    *   **域名**: 默认域名 `*.pages.dev` 在国内目前的存活率比 Vercel 和 Netlify 都要高（但不能保证永久有效）。
*   **挑战 (新手慎选)**:
    *   它不支持标准的 Node.js 运行时，而是使用 **Edge Runtime**。
    *   **兼容性问题**: 您的项目中如果使用了依赖 Node.js 原生 API (如 `fs`, `path`) 的库，可能会报错。
    *   **图片问题**: Next.js 自带的 `<Image />` 优化在 Cloudflare Pages 上无法直接使用，需要手动配置第三方图片加载器 (Loader)。
    *   **部署**: 需要在项目中安装 `@cloudflare/next-on-pages` 并修改构建命令。

---

## 综合建议

1.  **首选 (最稳)**: **Vercel (免费)** + **独立域名 (¥70/年)** + **Cloudflare DNS Only**。
    *   这是目前性价比最高、维护成本最低的方案。Vercel 负责计算，独立域名负责连通。
2.  **次选 (0成本)**: **Netlify (免费)**。
    *   赌运气使用它的默认域名，或者寻找免费的二级域名（如 `js.org` 等，但申请有门槛）。
3.  **折腾 (0成本)**: **Cloudflare Pages**。
    *   如果您愿意花时间解决 Edge Runtime 的兼容性报错，这是性能最好的免费方案。

---

## 代码层面深度净化 (已实施)

我们已经在代码中执行了以下“去国外化”操作：

### 1. 字体本地化
*   **操作**: 移除了 `next/font/google`。
*   **现状**: 使用 System Fonts (无网络请求)。
*   **进阶**: 如果必须要用特殊字体，请下载字体文件 (`.woff2`) 放到 `public/fonts` 目录，并在 CSS 中本地引用，**严禁**使用 Google Fonts CDN 链接。

### 2. 统计脚本替换
*   **Google Analytics**: 也就是 GA4。在国内会拖慢加载，且数据不准。
*   **替代方案**:
    *   **百度统计**: 国内最快，但界面老旧。
    *   **Umami (自建)**: 买一台最便宜的国内/香港云服务器 (20-30元/月)，搭建 Umami。
    *   **Clarity (微软)**: 微软的统计服务在国内访问速度尚可，比 Google 快。

### 3. 图标库
*   我们使用的是 `lucide-react`，它是基于 SVG 的组件库，打包在 JS 里，**完全没有网络请求**，非常完美。不要引入 FontAwesome CDN。

---

## 资源加载优化 (CDN)

如果您的博客图片很多，Supabase 的 AWS 存储可能会成为瓶颈。

### 方案 A: 使用 ImageKit (免费层级大)
1.  注册 [ImageKit.io](https://imagekit.io)。
2.  添加源 (Origin)，指向您的 Supabase Storage URL。
3.  它会提供一个全球 CDN 链接。
4.  在 Next.js 的 `next.config.mjs` 中配置 `images.loader`，把图片域名替换为 ImageKit 的域名。

### 方案 B: 阿里云/腾讯云 OSS (需备案)
*   **前提**: 您的域名必须有**ICP备案**（这要求您购买一台不少于3个月时长的国内服务器）。
*   如果没有备案，无法使用国内 CDN。

---

## 终极建议清单

对于个人开发者，不需要备案的**最佳性价比方案**：

1.  **部署**: 优先试用 **Zeabur** (香港节点)，或者 **Vercel** (配置 DNS Only)。
2.  **域名**: 必须买一个 `.com` 或 `.me` 独立域名。
3.  **数据库**: 继续用 Supabase (免费且强大)，虽然连接略慢但博客主要是“读”操作，Next.js 的缓存机制可以掩盖数据库的高延迟。
4.  **字体**: 坚决用系统默认字体。

按照此方案，您的博客在国内的秒开率可以达到 95% 以上。
