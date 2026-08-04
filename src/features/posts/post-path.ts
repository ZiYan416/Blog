const MIN_PUBLIC_POST_ID = 100000
const MAX_PUBLIC_POST_ID = 2147483647

export function parsePostPublicId(identifier: string): number | null {
  if (!/^\d{6,10}$/.test(identifier)) return null

  const publicId = Number(identifier)
  return Number.isInteger(publicId) &&
    publicId >= MIN_PUBLIC_POST_ID &&
    publicId <= MAX_PUBLIC_POST_ID
    ? publicId
    : null
}

export function getPostPath(publicId: number): string {
  if (
    !Number.isInteger(publicId) ||
    publicId < MIN_PUBLIC_POST_ID ||
    publicId > MAX_PUBLIC_POST_ID
  ) {
    throw new RangeError("文章公开编号必须是六至十位正整数")
  }

  return `/post/${publicId}`
}
