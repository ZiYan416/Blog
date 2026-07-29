# 图片存储与生命周期管理

## 存储选择

文章正文和封面统一通过博客同源接口 `POST /api/upload-image` 上传。接口先复用
Supabase 会话确认当前用户是管理员，再在服务端选择存储：

- 配置 `IMGBED_API_TOKEN`：上传到 `https://img.lunalbl.com/upload`，固定使用
  Hugging Face 通道。
- 未配置 `IMGBED_API_TOKEN`：继续上传到现有 Supabase `blog-images` bucket。

浏览器不会获得图床 Token，也不会携带 Token 直接请求图床。头像和收款码仍使用原有
Supabase `avatars` bucket，不受该可选配置影响。

图床上传目录格式为：

```text
blog/YYYY/MM/<articleSlug>
```

目录提示只接受有限长度的 ASCII 字母、数字、下划线、连字符和正斜杠分段。绝对路径、
反斜杠、控制字符、`.`、`..` 和编码绕过都会被拒绝。

## 环境变量与部署

本地开发在 `.env.local` 中配置：

```env
IMGBED_API_TOKEN=
```

该变量是可选的服务端 Secret：

- Token 至少需要 CloudFlare-ImgBed 的 `upload` 权限。
- 若要在文章更新、删除时自动清理图床文件，同一 Token 还需要 `delete` 权限。
- 不得改名为 `NEXT_PUBLIC_IMGBED_API_TOKEN`、`VITE_*` 或其他会进入浏览器包的变量。
- 不得把真实值写入 `.env.local.example`、源码、日志或 Git。

部署时在博客的运行平台配置 Secret，并重新部署：

- Production 环境必须单独配置。
- Preview 环境只有在需要测试图床上传时才配置。
- Cloudflare Pages/Workers 应将其设为加密 Secret；不要设为前端公开变量。
- Vercel 或其他 Next.js 托管平台应将其设为仅服务端环境变量。

本仓库使用 Next.js App Router Route Handler，并未包含 Cloudflare Pages 适配器配置。
如果博客实际部署到 Cloudflare，部署产物必须能够运行 Next.js Route Handler；纯静态导出
无法提供 `/api/upload-image`。

## 上传行为

编辑器支持：

- 工具栏选择一张或多张图片；
- 富文本和 Markdown 源码模式粘贴图片；
- 富文本和 Markdown 源码模式拖拽图片；
- 最多 3 张并发上传，并保持多图结果顺序；
- 上传期间状态提示和保存按钮保护；
- 在当前选择位置插入 Tiptap Image 节点或 Markdown 图片语法。

支持 JPEG、PNG、WebP、GIF 和 AVIF，图床单图上限为 15 MB。服务端同时校验 MIME
类型、文件大小和文件签名，不接受 SVG。现有 Supabase bucket 的约束仍是 10 MB 且不接受
AVIF，因此未配置图床时会对这两种情况给出明确提示。

图床返回值会在服务端归一化为：

```json
{
  "url": "https://img.lunalbl.com/...",
  "provider": "imgbed"
}
```

客户端只依赖 `url`。服务端只接受 HTTPS 且主机名为 `img.lunalbl.com` 的图床返回地址。

## 删除与引用保护

系统只管理两类文章图片：

1. `img.lunalbl.com` 下 `blog/` 命名空间中的文件；
2. 当前 Supabase 项目的 `blog-images` bucket 文件。

外部图片、图床其他目录和头像 bucket 永远不会被自动删除。

文章更新后，系统收集更新前正文和封面涉及的托管图片，再扫描数据库中所有文章的最新
正文和封面：

- 仍被当前文章或其他文章引用：保留；
- 已无任何文章引用：从对应存储删除；
- 引用检查失败：取消清理，避免误删。

文章删除时先删除文章记录，再执行同样的全库引用检查。外部存储清理无法与 Supabase
数据库事务原子提交，因此清理失败不会把已经成功的文章删除伪装成失败；接口会返回
`imageCleanup.failed`，管理界面会提示稍后手动处理。

管理员还可以调用同一接口显式删除单张托管图片：

```http
DELETE /api/upload-image
Content-Type: application/json

{ "url": "https://img.lunalbl.com/blog/2026/07/example.webp" }
```

若图片仍被任何文章引用，接口返回 `409 IMAGE_STILL_REFERENCED`。该接口不能删除博客
管理范围以外的 URL。

编辑时上传但从未保存到文章的图片不会形成数据库引用。浏览器关闭、断网等场景无法可靠
执行自动回收；这类孤儿文件应通过图床管理界面或上述管理员删除接口定期清理。

## 运维检查

部署后至少验证：

1. 管理员选择、粘贴和拖拽 PNG/JPEG/WebP，URL 使用 `img.lunalbl.com`。
2. 普通访客请求 `/api/upload-image` 得到 `401` 或 `403`。
3. 无文件、伪造 MIME、超限文件分别得到明确的 `4xx`。
4. 无 Secret 时图片仍进入 Supabase `blog-images`。
5. 删除文章时，共享图片保留，独占图片删除。
6. 图床 Token 缺少 `delete` 权限时文章仍删除，并返回图片清理告警。
7. 在浏览器源码、网络请求和构建产物中搜索不到真实 Token。
