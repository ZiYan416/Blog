import { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策 - 万物计数 (CountLife)",
  description: "万物计数 App 的隐私政策与用户协议",
};

export default function CountLifePrivacyPage() {
  return (
    <div className="container max-w-3xl mx-auto px-8 md:px-6 py-12 md:py-24">
      <header className="mb-6 md:mb-8 border-b border-black/5 dark:border-white/5 pb-6 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">万物计数 (CountLife) 隐私政策</h1>
        <p className="text-sm text-neutral-500">最近更新日期：2026年5月26日</p>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-h3:text-lg md:prose-h3:text-xl prose-p:text-neutral-600 dark:prose-p:text-neutral-400 prose-li:text-neutral-600 dark:prose-li:text-neutral-400">
        <p>
          欢迎使用“万物计数”（以下简称“本应用”）。本应用尊重并保护所有使用服务用户的个人隐私权。
          为了给您提供更准确、更有个性化的服务，本应用会按照本隐私权政策的规定使用和披露您的个人信息。
          但本应用将以高度的勤勉、审慎义务对待这些信息。除本隐私权政策另有规定外，在未征得您事先许可的情况下，本应用不会将这些信息对外披露或向第三方提供。
        </p>

        <h3>1. 信息的收集与使用</h3>
        <p>
          在使用本应用时，我们可能需要收集部分设备权限或信息，以确保软件功能的正常运行：
        </p>
        <ul>
          <li><strong>本地存储：</strong>本应用采用本地数据存储模式（如记录您的各类计数数据）。您的计数数据均保存在您的设备本地，我们不会将此类数据上传至任何云端服务器。</li>
          <li><strong>设备权限：</strong>本应用在提供特殊功能（如触觉反馈/震动或通过本地图库导出/导入数据）时，在获取您的明确授权后，可能会访问您的存储权限或震动马达权限。</li>
        </ul>

        <h3>2. 信息的共享与披露</h3>
        <p>
          我们不会将您的个人信息出售、出租或分享给任何第三方。所有与记录相关的数据皆存储于您的本地设备。
        </p>

        <h3>3. 法律及合规</h3>
        <p>
          如果法律要求或者在以下情况中，我们可能会披露您的相关信息：
        </p>
        <ul>
          <li>为遵守法律适用程序、诉讼、或者相关政府主张。</li>
          <li>为保护和捍卫本应用的合法权利或财产。</li>
          <li>在紧急情况下为保护本应用用户或公众的人身安全。</li>
        </ul>

        <h3>4. 未成年人保护</h3>
        <p>
          我们非常重视对未成年人个人信息的保护。如果您是未成年人，建议您请您的监护人仔细阅读本政策，并在征得您的监护人同意的前提下使用我们的服务。
        </p>

        <h3>5. 隐私政策的更改</h3>
        <p>
          我们可能会适时对本隐私权政策进行重大变更或由于应用的迭代升级带来的策略调整。更新后的内容将在应用内或我们的相关网站公布。
        </p>

        <h3>6. 联系我们</h3>
        <p>
          如果您对本隐私政策有任何疑问或建议，请通过支持邮箱或作者的联系方式与我们取得联系。
        </p>
      </div>
    </div>
  );
}