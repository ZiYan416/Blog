"use client"

export const BLOG_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const

export const BLOG_IMAGE_ACCEPT = BLOG_IMAGE_TYPES.join(",")
export const MAX_BLOG_IMAGE_SIZE = 15 * 1024 * 1024
export const MAX_CONCURRENT_IMAGE_UPLOADS = 3

export type BlogImagePurpose = "content" | "cover"

interface UploadImageResponse {
  url?: string
  error?: string
  code?: string
}

export interface UploadBlogImageOptions {
  articlePublicId?: number
  folder?: string
  purpose?: BlogImagePurpose
}

export interface BlogImageUploadResult {
  file: File
  url?: string
  error?: Error
}

const allowedImageTypes = new Set<string>(BLOG_IMAGE_TYPES)
const uploadByContentHash = new Map<string, Promise<string>>()
const MAX_UPLOAD_CACHE_ENTRIES = 100

function readFileBytes(file: File) {
  if (typeof file.arrayBuffer === "function") return file.arrayBuffer()

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
      } else {
        reject(new Error("无法读取图片内容"))
      }
    })
    reader.addEventListener("error", () => {
      reject(new Error("无法读取图片内容"))
    })
    reader.readAsArrayBuffer(file)
  })
}

async function getFileContentHash(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await readFileBytes(file))
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")
}

function rememberUpload(contentHash: string, upload: Promise<string>) {
  if (uploadByContentHash.size >= MAX_UPLOAD_CACHE_ENTRIES) {
    const oldestContentHash = uploadByContentHash.keys().next().value
    if (oldestContentHash) uploadByContentHash.delete(oldestContentHash)
  }

  uploadByContentHash.set(contentHash, upload)
}

export function validateBlogImage(file: File) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("图片格式不支持，请使用 JPEG、PNG、WebP、GIF 或 AVIF")
  }

  if (file.size <= 0) {
    throw new Error("图片文件为空")
  }

  if (file.size > MAX_BLOG_IMAGE_SIZE) {
    throw new Error("图片大小不能超过 15 MB")
  }
}

export async function uploadBlogImage(
  file: File,
  options: UploadBlogImageOptions = {}
): Promise<string> {
  validateBlogImage(file)

  const contentHash = await getFileContentHash(file)
  const existingUpload = uploadByContentHash.get(contentHash)
  if (existingUpload) return existingUpload

  const upload = uploadBlogImageWithoutDeduplication(file, options)
  rememberUpload(contentHash, upload)

  try {
    return await upload
  } catch (error) {
    if (uploadByContentHash.get(contentHash) === upload) {
      uploadByContentHash.delete(contentHash)
    }
    throw error
  }
}

async function uploadBlogImageWithoutDeduplication(
  file: File,
  options: UploadBlogImageOptions
): Promise<string> {
  const body = new FormData()
  body.append("file", file)
  if (options.articlePublicId !== undefined) {
    body.append("articlePublicId", String(options.articlePublicId))
  }
  if (options.folder) body.append("folder", options.folder)
  if (options.purpose) body.append("purpose", options.purpose)

  const response = await fetch("/api/upload-image", {
    method: "POST",
    body,
  })

  let result: UploadImageResponse
  try {
    result = (await response.json()) as UploadImageResponse
  } catch {
    throw new Error("图片上传服务返回了无效响应")
  }

  if (!response.ok || !result.url) {
    throw new Error(result.error || "图片上传失败，请稍后重试")
  }

  return result.url
}

export async function uploadBlogImages(
  files: readonly File[],
  options: UploadBlogImageOptions = {},
  concurrency = MAX_CONCURRENT_IMAGE_UPLOADS
): Promise<BlogImageUploadResult[]> {
  const results = new Array<BlogImageUploadResult>(files.length)
  const workerCount = Math.min(
    Math.max(1, Math.floor(concurrency)),
    files.length
  )
  let nextIndex = 0

  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex < files.length) {
      const index = nextIndex++
      const file = files[index]

      try {
        results[index] = {
          file,
          url: await uploadBlogImage(file, options),
        }
      } catch (error) {
        results[index] = {
          file,
          error:
            error instanceof Error
              ? error
              : new Error("图片上传失败，请稍后重试"),
        }
      }
    }
  })

  await Promise.all(workers)
  return results
}

export function getImageAltText(file: File) {
  const withoutExtension = file.name.replace(/\.[^.]+$/, "").trim()
  return (withoutExtension || "图片").replace(/[[\]]/g, "")
}
