import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { AccessError, requireAdmin } from "@/lib/server-auth"
import {
  getValidationMessage,
  postAutosaveRequestSchema,
} from "@/lib/validation"

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>

const NO_STORE_HEADERS = { "Cache-Control": "no-store" }
const queryIdSchema = z.uuid()

function mapAutosave(row: {
  id: string
  post_id: string | null
  title: string
  slug: string | null
  content: string
  cover_image: string | null
  tags: string[]
  base_post_updated_at: string | null
  version: number
  updated_at: string
}) {
  return {
    draftId: row.id,
    postId: row.post_id,
    basePostUpdatedAt: row.base_post_updated_at,
    version: row.version,
    updatedAt: row.updated_at,
    snapshot: {
      title: row.title,
      slug: row.slug || "",
      content: row.content,
      coverImage: row.cover_image || "",
      tags: row.tags,
    },
  }
}

function accessErrorResponse(error: unknown) {
  if (!(error instanceof AccessError)) return null
  return NextResponse.json(
    { error: error.message, code: error.code },
    { status: error.status, headers: NO_STORE_HEADERS }
  )
}

function conflictResponse(
  message: string,
  code: "AUTOSAVE_CONFLICT" | "POST_VERSION_CONFLICT",
  current?: Parameters<typeof mapAutosave>[0] | null
) {
  return NextResponse.json(
    {
      error: message,
      code,
      autosave: current ? mapAutosave(current) : null,
    },
    { status: 409, headers: NO_STORE_HEADERS }
  )
}

async function findAutosave(
  supabase: ServerSupabaseClient,
  authorId: string,
  _draftId: string,
  postId: string | null
) {
  const query = supabase
    .from("post_autosaves")
    .select("*")
    .eq("author_id", authorId)

  return postId
    ? query.eq("post_id", postId).maybeSingle()
    : query
        .is("post_id", null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()
}

function sameInstant(left: string | null, right: string | null) {
  if (!left || !right) return left === right
  return new Date(left).getTime() === new Date(right).getTime()
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  let user

  try {
    user = await requireAdmin(supabase)
  } catch (error) {
    return accessErrorResponse(error) ?? NextResponse.json(
      { error: "服务器错误" },
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }

  const postId = request.nextUrl.searchParams.get("postId")
  const draftId = request.nextUrl.searchParams.get("draftId")
  const latestNew = request.nextUrl.searchParams.get("latestNew") === "true"

  let query = supabase
    .from("post_autosaves")
    .select("*")
    .eq("author_id", user.id)

  if (postId) {
    if (!queryIdSchema.safeParse(postId).success) {
      return NextResponse.json(
        { error: "文章 ID 格式无效" },
        { status: 400, headers: NO_STORE_HEADERS }
      )
    }
    query = query.eq("post_id", postId)
  } else if (draftId) {
    if (!queryIdSchema.safeParse(draftId).success) {
      return NextResponse.json(
        { error: "自动保存 ID 格式无效" },
        { status: 400, headers: NO_STORE_HEADERS }
      )
    }
    query = query.eq("id", draftId)
  } else if (latestNew) {
    query = query.is("post_id", null).order("updated_at", { ascending: false }).limit(1)
  } else {
    return NextResponse.json(
      { error: "缺少自动保存查询条件" },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  const { data, error } = await query.maybeSingle()
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }

  return NextResponse.json(
    { autosave: data ? mapAutosave(data) : null },
    { headers: NO_STORE_HEADERS }
  )
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  let user

  try {
    user = await requireAdmin(supabase)
  } catch (error) {
    return accessErrorResponse(error) ?? NextResponse.json(
      { error: "服务器错误" },
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "请求体必须是有效的 JSON" },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  const parsedBody = postAutosaveRequestSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: getValidationMessage(parsedBody.error) },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  const {
    draftId,
    postId,
    basePostUpdatedAt,
    expectedVersion,
    snapshot,
  } = parsedBody.data

  if (postId) {
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, updated_at")
      .eq("id", postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404, headers: NO_STORE_HEADERS }
      )
    }

    if (!sameInstant(post.updated_at, basePostUpdatedAt)) {
      const { data: current } = await findAutosave(
        supabase,
        user.id,
        draftId,
        postId
      )
      return conflictResponse(
        "文章已在其他位置更新，请先重新加载最新版本",
        "POST_VERSION_CONFLICT",
        current
      )
    }
  }

  const { data: existing, error: findError } = await findAutosave(
    supabase,
    user.id,
    draftId,
    postId
  )

  if (findError) {
    return NextResponse.json(
      { error: findError.message },
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }

  if (existing) {
    if (existing.id !== draftId || existing.version !== expectedVersion) {
      return conflictResponse(
        "自动保存内容已被其他标签页更新",
        "AUTOSAVE_CONFLICT",
        existing
      )
    }

    const nextVersion = existing.version + 1
    const { data: updated, error: updateError } = await supabase
      .from("post_autosaves")
      .update({
        title: snapshot.title,
        slug: snapshot.slug || null,
        content: snapshot.content,
        cover_image: snapshot.coverImage || null,
        tags: snapshot.tags,
        base_post_updated_at: basePostUpdatedAt,
        version: nextVersion,
      })
      .eq("id", existing.id)
      .eq("author_id", user.id)
      .eq("version", existing.version)
      .select("*")
      .maybeSingle()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500, headers: NO_STORE_HEADERS }
      )
    }

    if (!updated) {
      const { data: current } = await findAutosave(
        supabase,
        user.id,
        draftId,
        postId
      )
      return conflictResponse(
        "自动保存内容已被其他标签页更新",
        "AUTOSAVE_CONFLICT",
        current
      )
    }

    return NextResponse.json(
      { autosave: mapAutosave(updated) },
      { headers: NO_STORE_HEADERS }
    )
  }

  if (expectedVersion !== null) {
    return conflictResponse(
      "自动保存版本不存在，请重新加载",
      "AUTOSAVE_CONFLICT"
    )
  }

  const { data: created, error: createError } = await supabase
    .from("post_autosaves")
    .insert({
      id: draftId,
      author_id: user.id,
      post_id: postId,
      title: snapshot.title,
      slug: snapshot.slug || null,
      content: snapshot.content,
      cover_image: snapshot.coverImage || null,
      tags: snapshot.tags,
      base_post_updated_at: basePostUpdatedAt,
    })
    .select("*")
    .single()

  if (createError) {
    if (createError.code === "23505") {
      const { data: current } = await findAutosave(
        supabase,
        user.id,
        draftId,
        postId
      )
      return conflictResponse(
        "自动保存内容已被其他标签页创建",
        "AUTOSAVE_CONFLICT",
        current
      )
    }

    return NextResponse.json(
      { error: createError.message },
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }

  return NextResponse.json(
    { autosave: mapAutosave(created) },
    { status: 201, headers: NO_STORE_HEADERS }
  )
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  let user

  try {
    user = await requireAdmin(supabase)
  } catch (error) {
    return accessErrorResponse(error) ?? NextResponse.json(
      { error: "服务器错误" },
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }

  const draftId = request.nextUrl.searchParams.get("draftId")
  if (!draftId || !queryIdSchema.safeParse(draftId).success) {
    return NextResponse.json(
      { error: draftId ? "自动保存 ID 格式无效" : "缺少自动保存 ID" },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  const { error } = await supabase
    .from("post_autosaves")
    .delete()
    .eq("id", draftId)
    .eq("author_id", user.id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }

  return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS })
}
