export const IMGBED_ORIGIN = "https://img.lunalbl.com"
export const BLOG_IMAGE_BUCKET = "blog-images"

export type ManagedImageProvider = "imgbed" | "supabase"

export interface ManagedImageAsset {
  provider: ManagedImageProvider
  fileId: string
  url: string
}

function safeDecodePath(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function normalizeFileId(value: string) {
  return safeDecodePath(value)
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .join("/")
}

export function getManagedImageKey(asset: ManagedImageAsset) {
  return `${asset.provider}:${asset.fileId}`
}

export function parseManagedImageUrl(
  value: string,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
): ManagedImageAsset | null {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }

  if (url.protocol !== "https:") return null

  const imgBedHost = new URL(IMGBED_ORIGIN).hostname
  if (
    url.origin === IMGBED_ORIGIN &&
    !url.username &&
    !url.password &&
    url.hostname === imgBedHost
  ) {
    const path = url.pathname.startsWith("/file/")
      ? url.pathname.slice("/file/".length)
      : url.pathname.slice(1)
    const fileId = normalizeFileId(path)

    // Only assets created inside the blog namespace may be lifecycle-managed.
    if (!fileId.startsWith("blog/")) return null

    return { provider: "imgbed", fileId, url: url.toString() }
  }

  let supabaseHost = ""
  try {
    supabaseHost = new URL(supabaseUrl).hostname
  } catch {
    return null
  }

  if (!supabaseHost || url.hostname !== supabaseHost) return null

  const prefix = `/storage/v1/object/public/${BLOG_IMAGE_BUCKET}/`
  const prefixIndex = url.pathname.indexOf(prefix)
  if (prefixIndex < 0) return null

  const fileId = normalizeFileId(url.pathname.slice(prefixIndex + prefix.length))
  if (!fileId) return null

  return { provider: "supabase", fileId, url: url.toString() }
}

export function extractManagedImageAssets(
  content: string | null | undefined,
  coverImage?: string | null,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
) {
  const candidates = new Set<string>()
  if (coverImage) candidates.add(coverImage.trim())

  for (const match of content?.matchAll(/https:\/\/[^\s<>"'`)\]}]+/g) || []) {
    candidates.add(match[0])
  }

  const assets = new Map<string, ManagedImageAsset>()
  for (const candidate of candidates) {
    const asset = parseManagedImageUrl(candidate, supabaseUrl)
    if (asset) assets.set(getManagedImageKey(asset), asset)
  }

  return [...assets.values()]
}
