import "server-only"

import pinyin from "pinyin"

export function generatePostSlug(value: string): string {
  const pinyinTitle = pinyin(value, {
    style: pinyin.STYLE_NORMAL,
    heteronym: false,
  })
    .flat()
    .join("-")

  return pinyinTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function resolveArticleUploadSlug({
  articleSlug,
  articleTitle,
}: {
  articleSlug?: string | null
  articleTitle?: string | null
}): string | null {
  const explicitSlug = articleSlug?.trim()
  if (explicitSlug) return explicitSlug

  const title = articleTitle?.trim()
  if (!title) return null

  return generatePostSlug(title) || null
}
