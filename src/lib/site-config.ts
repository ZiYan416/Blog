const DEFAULT_SITE_URL = "http://localhost:3000";

function resolveSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    return new URL(configuredUrl || DEFAULT_SITE_URL);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Blog",
  description: "用心感受生活的温度，用代码构建数字的花园。",
  url: resolveSiteUrl(),
};

export function absoluteSiteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
