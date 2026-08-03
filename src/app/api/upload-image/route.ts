import { NextResponse, type NextRequest } from "next/server"
import { extractManagedImageAssets } from "@/features/posts/image-assets"
import { apiError } from "@/lib/api-response"
import { AccessError, requireAdmin } from "@/lib/server-auth"
import { createClient } from "@/lib/supabase/server"
import {
  cleanupUnusedImageAssets,
  ImageStorageError,
  storeBlogImage,
} from "@/server/image-storage"
import { resolveArticleUploadSlug } from "@/server/slug"

export const runtime = "nodejs"

async function getAdminClient() {
  const supabase = await createClient()
  await requireAdmin(supabase)
  return supabase
}

function handleRouteError(error: unknown) {
  if (error instanceof AccessError) {
    return apiError(error.message, error.status, error.code)
  }
  if (error instanceof ImageStorageError) {
    return apiError(error.message, error.status, error.code)
  }

  console.error("Image API failed", {
    message: error instanceof Error ? error.message : "unknown error",
  })
  return apiError("图片服务发生错误，请稍后重试", 500, "IMAGE_SERVICE_ERROR")
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getAdminClient()
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return apiError("请求必须使用 multipart/form-data", 400, "INVALID_FORM_DATA")
    }

    const value = formData.get("file")
    if (!(value instanceof File)) {
      return apiError("未选择图片文件", 400, "IMAGE_REQUIRED")
    }

    const folder = formData.get("folder")
    const articleSlug = formData.get("articleSlug")
    const articleTitle = formData.get("articleTitle")
    const stored = await storeBlogImage(supabase, value, {
      folder: typeof folder === "string" ? folder : null,
      articleSlug: resolveArticleUploadSlug({
        articleSlug: typeof articleSlug === "string" ? articleSlug : null,
        articleTitle: typeof articleTitle === "string" ? articleTitle : null,
      }),
    })

    return NextResponse.json(stored)
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getAdminClient()
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return apiError("请求体必须是有效的 JSON", 400, "INVALID_JSON")
    }

    const url =
      typeof body === "object" &&
      body !== null &&
      "url" in body &&
      typeof body.url === "string"
        ? body.url
        : ""
    const [asset] = extractManagedImageAssets("", url)

    if (!asset) {
      return apiError(
        "只能删除由博客管理的图片",
        400,
        "UNMANAGED_IMAGE_URL"
      )
    }

    const cleanup = await cleanupUnusedImageAssets(supabase, [asset])
    if (cleanup.skippedReferenced.length > 0) {
      return apiError(
        "图片仍被文章引用，无法删除",
        409,
        "IMAGE_STILL_REFERENCED"
      )
    }
    if (cleanup.failed.length > 0) {
      return apiError(
        "图片删除失败，请稍后重试",
        502,
        cleanup.failed[0].code
      )
    }

    return NextResponse.json({ success: true, cleanup })
  } catch (error) {
    return handleRouteError(error)
  }
}
