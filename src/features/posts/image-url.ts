const BING_IMAGE_PATH = /^\/th\/id\//i

/**
 * Restores known image-search thumbnail URLs to their original asset endpoint.
 * Query parameters on other hosts may be signatures or intentional transforms,
 * so they are preserved.
 */
export function getHighResolutionImageUrl(src: string) {
  try {
    const url = new URL(src)
    const isBingImage =
      url.hostname.toLowerCase().endsWith(".bing.net") &&
      BING_IMAGE_PATH.test(url.pathname)

    if (isBingImage) {
      url.search = ""
      url.hash = ""
      return url.toString()
    }
  } catch {
    // Relative URLs and malformed external URLs are returned unchanged.
  }

  return src
}
