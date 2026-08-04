import type { SupabaseClient } from "@supabase/supabase-js"
import sharp from "sharp"
import type { Database } from "@/lib/types"
import {
  BLOG_IMAGE_BUCKET,
  extractManagedImageAssets,
  getManagedImageKey,
  IMGBED_ORIGIN,
  type ManagedImageAsset,
} from "@/features/posts/image-assets"

const MAX_IMAGE_SIZE = 15 * 1024 * 1024
const SUPABASE_FALLBACK_MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
}
const SAFE_FOLDER_SEGMENT = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/
const COVER_MAX_DIMENSION = 3840
const COVER_WEBP_QUALITY = 82

export type ImageUploadPurpose = "content" | "cover"

interface ImgBedUploadResult {
  src?: string
  publicUrl?: string
}

export interface StoredImage {
  url: string
  src?: string
  publicUrl?: string
  provider: "imgbed" | "supabase"
}

export interface ImageCleanupResult {
  requested: number
  deleted: string[]
  skippedReferenced: string[]
  failed: Array<{ url: string; code: string }>
}

export class ImageStorageError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message)
    this.name = "ImageStorageError"
  }
}

function readAscii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length))
}

async function hasExpectedSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer())

  switch (file.type) {
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    case "image/png":
      return (
        bytes[0] === 0x89 &&
        readAscii(bytes, 1, 3) === "PNG" &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      )
    case "image/gif":
      return ["GIF87a", "GIF89a"].includes(readAscii(bytes, 0, 6))
    case "image/webp":
      return readAscii(bytes, 0, 4) === "RIFF" && readAscii(bytes, 8, 4) === "WEBP"
    case "image/avif":
      return (
        readAscii(bytes, 4, 4) === "ftyp" &&
        ["avif", "avis"].some((brand) => readAscii(bytes, 8, 24).includes(brand))
      )
    default:
      return false
  }
}

export async function validateImageFile(file: File) {
  if (!file.name || file.size <= 0) {
    throw new ImageStorageError("未选择图片文件", 400, "IMAGE_REQUIRED")
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new ImageStorageError(
      "图片格式不支持，请使用 JPEG、PNG、WebP、GIF 或 AVIF",
      415,
      "UNSUPPORTED_IMAGE_TYPE"
    )
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new ImageStorageError(
      "图片大小不能超过 15 MB",
      413,
      "IMAGE_TOO_LARGE"
    )
  }

  if (!(await hasExpectedSignature(file))) {
    throw new ImageStorageError(
      "图片内容与文件格式不匹配",
      415,
      "INVALID_IMAGE_CONTENT"
    )
  }
}

export function parseImageUploadPurpose(value: FormDataEntryValue | null) {
  if (value === null || value === "" || value === "content") return "content"
  if (value === "cover") return "cover"

  throw new ImageStorageError(
    "图片用途参数无效",
    400,
    "INVALID_IMAGE_PURPOSE"
  )
}

function getWebpFilename(filename: string) {
  const basename = filename.replace(/\.[^.]+$/, "").trim() || "cover"
  return `${basename}.webp`
}

export async function prepareImageForStorage(
  file: File,
  purpose: ImageUploadPurpose
) {
  if (purpose !== "cover") return file

  try {
    const input = Buffer.from(await file.arrayBuffer())
    const metadata = await sharp(input).metadata()

    // Preserve animation instead of silently flattening it to the first frame.
    if ((metadata.pages || 1) > 1) return file

    const output = await sharp(input)
      .rotate()
      .resize({
        width: COVER_MAX_DIMENSION,
        height: COVER_MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: COVER_WEBP_QUALITY,
        smartSubsample: true,
      })
      .toBuffer()

    return new File([new Uint8Array(output)], getWebpFilename(file.name), {
      type: "image/webp",
      lastModified: file.lastModified,
    })
  } catch (error) {
    console.warn("Cover image optimization failed; uploading original image", {
      message: error instanceof Error ? error.message : "unknown error",
    })
    return file
  }
}

function decodeFolderHint(value: string) {
  let decoded = value
  for (let index = 0; index < 2 && /%[0-9a-f]{2}/i.test(decoded); index++) {
    try {
      decoded = decodeURIComponent(decoded)
    } catch {
      throw new ImageStorageError("图片目录格式无效", 400, "INVALID_UPLOAD_FOLDER")
    }
  }
  return decoded
}

function getSafeFolderSegments(value: string | null | undefined) {
  if (!value?.trim()) return []

  const decoded = decodeFolderHint(value.trim())
  if (
    decoded.length > 256 ||
    decoded.startsWith("/") ||
    decoded.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(decoded)
  ) {
    throw new ImageStorageError("图片目录格式无效", 400, "INVALID_UPLOAD_FOLDER")
  }

  const segments = decoded.split("/")
  if (
    segments.length > 4 ||
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        !SAFE_FOLDER_SEGMENT.test(segment)
    )
  ) {
    throw new ImageStorageError("图片目录格式无效", 400, "INVALID_UPLOAD_FOLDER")
  }

  return segments
}

export function buildImageUploadFolder(
  options: { folder?: string | null; articlePublicId?: number | null },
  now = new Date()
) {
  const suffix = options.folder?.trim()
    ? getSafeFolderSegments(options.folder)
    : options.articlePublicId === null || options.articlePublicId === undefined
      ? []
      : getSafeFolderSegments(String(options.articlePublicId))

  return [
    "blog",
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    ...suffix,
  ].join("/")
}

function getValidImgBedUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined

  try {
    const url = new URL(value, IMGBED_ORIGIN)
    const expected = new URL(IMGBED_ORIGIN)
    if (
      url.origin !== expected.origin ||
      url.protocol !== "https:" ||
      url.hostname !== expected.hostname ||
      url.username ||
      url.password
    ) {
      return undefined
    }
    return url.toString()
  } catch {
    return undefined
  }
}

function sanitizeUpstreamDetail(detail: string, token: string) {
  return detail
    .replaceAll(token, "[REDACTED]")
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
    .slice(0, 1000)
}

async function uploadToImgBed(file: File, token: string, folder: string) {
  const url = new URL("/upload", IMGBED_ORIGIN)
  url.searchParams.set("uploadChannel", "huggingface")
  url.searchParams.set("returnFormat", "full")
  url.searchParams.set("uploadNameType", "short")
  url.searchParams.set("uploadFolder", folder)
  url.searchParams.set("autoRetry", "false")

  const body = new FormData()
  body.append("file", file, file.name)

  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
      signal: AbortSignal.timeout(60_000),
    })
  } catch (error) {
    console.error("ImgBed upload request failed", {
      message: error instanceof Error ? error.message : "unknown error",
    })
    throw new ImageStorageError(
      "图床服务暂时不可用，请稍后重试",
      502,
      "IMGBED_UNAVAILABLE"
    )
  }

  const text = await response.text()
  if (!response.ok) {
    console.error("ImgBed upload failed", {
      status: response.status,
      detail: sanitizeUpstreamDetail(text, token),
    })
    throw new ImageStorageError(
      "图片上传失败，请稍后重试",
      502,
      "IMGBED_UPLOAD_FAILED"
    )
  }

  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    console.error("ImgBed upload returned invalid JSON", {
      status: response.status,
    })
    throw new ImageStorageError(
      "图床服务返回了无效响应",
      502,
      "IMGBED_INVALID_RESPONSE"
    )
  }

  if (!Array.isArray(data)) {
    throw new ImageStorageError(
      "图床服务返回了无效响应",
      502,
      "IMGBED_INVALID_RESPONSE"
    )
  }

  const first = data[0] as ImgBedUploadResult | undefined
  const publicUrl = getValidImgBedUrl(first?.publicUrl)
  const src = getValidImgBedUrl(first?.src)
  const selectedUrl = publicUrl || src

  if (!selectedUrl) {
    throw new ImageStorageError(
      "图床未返回可用的图片地址",
      502,
      "IMGBED_URL_MISSING"
    )
  }

  return {
    url: selectedUrl,
    src,
    publicUrl,
    provider: "imgbed" as const,
  }
}

async function uploadToSupabase(
  supabase: SupabaseClient<Database>,
  file: File,
  folder: string
) {
  if (file.size > SUPABASE_FALLBACK_MAX_SIZE) {
    throw new ImageStorageError(
      "默认图片存储单图不能超过 10 MB；配置图床后可上传至 15 MB",
      413,
      "SUPABASE_IMAGE_TOO_LARGE"
    )
  }

  if (file.type === "image/avif") {
    throw new ImageStorageError(
      "默认图片存储暂不支持 AVIF；请改用 JPEG、PNG、WebP 或 GIF",
      415,
      "SUPABASE_AVIF_UNSUPPORTED"
    )
  }

  const extension = EXTENSION_BY_TYPE[file.type]
  const filePath = `${folder}/${crypto.randomUUID()}.${extension}`
  let error: { message: string } | null
  try {
    const upload = await supabase.storage
      .from(BLOG_IMAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      })
    error = upload.error
  } catch (uploadError) {
    console.error("Supabase image upload request failed", {
      message:
        uploadError instanceof Error ? uploadError.message : "unknown error",
    })
    throw new ImageStorageError(
      "默认图片存储暂时不可用，请稍后重试",
      502,
      "SUPABASE_UNAVAILABLE"
    )
  }

  if (error) {
    console.error("Supabase image upload failed", {
      message: error.message,
    })
    throw new ImageStorageError(
      "图片上传失败，请检查默认存储配置",
      502,
      "SUPABASE_UPLOAD_FAILED"
    )
  }

  const { data } = supabase.storage.from(BLOG_IMAGE_BUCKET).getPublicUrl(filePath)
  return {
    url: data.publicUrl,
    publicUrl: data.publicUrl,
    provider: "supabase" as const,
  }
}

export async function storeBlogImage(
  supabase: SupabaseClient<Database>,
  file: File,
  options: {
    folder?: string | null
    articlePublicId?: number | null
    purpose?: ImageUploadPurpose
  }
): Promise<StoredImage> {
  await validateImageFile(file)
  const preparedFile = await prepareImageForStorage(
    file,
    options.purpose || "content"
  )
  const folder = buildImageUploadFolder(options)
  const token = process.env.IMGBED_API_TOKEN?.trim()

  return token
    ? uploadToImgBed(preparedFile, token, folder)
    : uploadToSupabase(supabase, preparedFile, folder)
}

async function deleteImgBedAsset(asset: ManagedImageAsset) {
  const token = process.env.IMGBED_API_TOKEN?.trim()
  if (!token) {
    return { success: false, code: "IMGBED_NOT_CONFIGURED" }
  }

  const encodedFileId = asset.fileId
    .split("/")
    .map(encodeURIComponent)
    .join("/")
  const url = new URL(`/api/manage/delete/${encodedFileId}`, IMGBED_ORIGIN)

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(30_000),
    })
    const text = await response.text()
    if (!response.ok) {
      console.error("ImgBed delete failed", {
        status: response.status,
        fileId: asset.fileId,
        detail: sanitizeUpstreamDetail(text, token),
      })
      return { success: false, code: "IMGBED_DELETE_FAILED" }
    }

    return { success: true, code: "DELETED" }
  } catch (error) {
    console.error("ImgBed delete request failed", {
      fileId: asset.fileId,
      message: error instanceof Error ? error.message : "unknown error",
    })
    return { success: false, code: "IMGBED_DELETE_FAILED" }
  }
}

async function deleteSupabaseAsset(
  supabase: SupabaseClient<Database>,
  asset: ManagedImageAsset
) {
  const { error } = await supabase.storage
    .from(BLOG_IMAGE_BUCKET)
    .remove([asset.fileId])

  if (error) {
    console.error("Supabase image delete failed", {
      fileId: asset.fileId,
      message: error.message,
    })
    return { success: false, code: "SUPABASE_DELETE_FAILED" }
  }

  return { success: true, code: "DELETED" }
}

async function deleteManagedAsset(
  supabase: SupabaseClient<Database>,
  asset: ManagedImageAsset
) {
  return asset.provider === "imgbed"
    ? deleteImgBedAsset(asset)
    : deleteSupabaseAsset(supabase, asset)
}

async function getReferencedAssetKeys(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("posts")
    .select("content, cover_image")

  if (error) {
    console.error("Failed to inspect post image references", {
      message: error.message,
    })
    throw new ImageStorageError(
      "无法检查图片引用，已取消图片清理",
      500,
      "IMAGE_REFERENCE_CHECK_FAILED"
    )
  }

  const referenced = new Set<string>()
  for (const post of data || []) {
    for (const asset of extractManagedImageAssets(
      post.content,
      post.cover_image
    )) {
      referenced.add(getManagedImageKey(asset))
    }
  }
  return referenced
}

export async function cleanupUnusedImageAssets(
  supabase: SupabaseClient<Database>,
  candidates: readonly ManagedImageAsset[]
): Promise<ImageCleanupResult> {
  const uniqueCandidates = new Map(
    candidates.map((asset) => [getManagedImageKey(asset), asset])
  )
  const result: ImageCleanupResult = {
    requested: uniqueCandidates.size,
    deleted: [],
    skippedReferenced: [],
    failed: [],
  }

  if (uniqueCandidates.size === 0) return result

  let referenced: Set<string>
  try {
    referenced = await getReferencedAssetKeys(supabase)
  } catch (error) {
    const code =
      error instanceof ImageStorageError
        ? error.code
        : "IMAGE_REFERENCE_CHECK_FAILED"
    result.failed = [...uniqueCandidates.values()].map((asset) => ({
      url: asset.url,
      code,
    }))
    return result
  }

  for (const [key, asset] of uniqueCandidates) {
    if (referenced.has(key)) {
      result.skippedReferenced.push(asset.url)
      continue
    }

    let deletion: { success: boolean; code: string }
    try {
      deletion = await deleteManagedAsset(supabase, asset)
    } catch (error) {
      console.error("Managed image delete request failed", {
        provider: asset.provider,
        fileId: asset.fileId,
        message: error instanceof Error ? error.message : "unknown error",
      })
      deletion = {
        success: false,
        code:
          asset.provider === "imgbed"
            ? "IMGBED_DELETE_FAILED"
            : "SUPABASE_DELETE_FAILED",
      }
    }
    if (deletion.success) {
      result.deleted.push(asset.url)
    } else {
      result.failed.push({ url: asset.url, code: deletion.code })
    }
  }

  return result
}
