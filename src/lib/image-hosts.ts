export const IMGBED_ORIGIN = "https://img.lunalbl.com"
export const IMGBED_HOSTNAME = new URL(IMGBED_ORIGIN).hostname

const SUPABASE_PUBLIC_IMAGE_PREFIX = "/storage/v1/object/public/"
const BING_IMAGE_PATH = /^\/th\/id\//i

export function getSupabaseHostname() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").hostname
  } catch {
    return ""
  }
}

export function canUseNextImageOptimizer(src: string) {
  if (src.startsWith("/")) return true

  try {
    const url = new URL(src)
    if (url.protocol !== "https:" || url.username || url.password) return false

    const supabaseHostname = getSupabaseHostname()
    if (
      supabaseHostname &&
      url.hostname === supabaseHostname &&
      url.pathname.startsWith(SUPABASE_PUBLIC_IMAGE_PREFIX)
    ) {
      return true
    }

    return (
      url.origin === IMGBED_ORIGIN ||
      url.hostname === "avatars.githubusercontent.com" ||
      (url.hostname.endsWith(".bing.net") && BING_IMAGE_PATH.test(url.pathname))
    )
  } catch {
    return false
  }
}
