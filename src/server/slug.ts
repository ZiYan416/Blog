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
