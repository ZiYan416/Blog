
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策 | Blog",
  description: "了解我们如何处理和保护您的个人信息。",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl mx-auto px-8 md:px-6 py-12 md:py-24">
      <header className="mb-6 md:mb-8 border-b border-black/5 dark:border-white/5 pb-6 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">隐私政策</h1>
        <p className="text-sm text-neutral-500">更新日期：2026年2月4日</p>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-h3:text-lg md:prose-h3:text-xl prose-p:text-neutral-600 dark:prose-p:text-neutral-400 prose-li:text-neutral-600 dark:prose-li:text-neutral-400">
        <p className="italic">
          欢迎访问 Blog（以下简称“本网站”）。我们深知个人信息对您的重要性，并会尽力保护您的隐私安全。
          本隐私政策旨在向您说明我们如何收集、使用、存储和分享您的信息。
        </p>

        <h3>1. 信息收集</h3>
        <p>
          当您使用本网站时，我们可能会收集以下类型的信息：
        </p>
        <ul>
          <li><strong>账户信息：</strong>如果您选择登录，我们会通过 Supabase Auth 和 OAuth 提供商（如 GitHub）收集您的电子邮箱地址、头像和显示名称。这些信息仅用于身份验证和个性化展示。</li>
          <li><strong>使用数据：</strong>我们可能会收集有关您如何访问和使用本网站的非个人识别信息，例如浏览器类型、访问时间、页面浏览量等。这些数据用于分析网站流量和优化用户体验。</li>
        </ul>

        <h3>2. 信息使用</h3>
        <p>
          我们收集的信息主要用于：
        </p>
        <ul>
          <li>提供、维护和改进本网站的服务；</li>
          <li>管理您的账户并提供客户支持；</li>
          <li>发送与服务相关的通知（如安全更新）；</li>
          <li>防止欺诈和滥用行为。</li>
        </ul>

        <h3>3. 信息共享</h3>
        <p>
          我们要么严格保密您的个人信息，要么只在以下情况下共享：
        </p>
        <ul>
          <li><strong>法律要求：</strong>在遵守适用法律、法规或法律程序的情况下。</li>
          <li><strong>您的同意：</strong>在获得您明确同意的情况下。</li>
        </ul>
        <p>
          我们不会将您的个人信息出售给任何第三方。
        </p>

        <h3>4. 数据存储与安全</h3>
        <p>
          我们使用业界标准的安全措施来保护您的信息。您的数据主要存储在 Supabase 提供的安全数据库中。尽管如此，请注意没有任何互联网传输或电子存储方法是 100% 安全的。
        </p>

        <h3>5. Cookie 技术</h3>
        <p>
          本网站可能会使用 Cookie 或类似技术来改善用户体验，例如保持您的登录状态或保存您的主题偏好（亮色/暗色模式）。您可以通过浏览器设置拒绝 Cookie，但这可能会影响网站的部分功能。
        </p>

        <h3>6. 政策更新</h3>
        <p>
          我们可能会不时更新本隐私政策。任何更改都将在此页面上发布，建议您定期查阅。
        </p>

        <h3>7. 联系我们</h3>
        <p>
          如果您对本隐私政策有任何疑问，请通过 GitHub 或网站上的联系方式与我们联系。
        </p>
      </div>
    </div>
  );
}
