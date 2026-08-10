// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type {
  LocalPostAutosaveRecord,
  PostAutosaveRecord,
  PostAutosaveSnapshot,
} from "@/features/posts/autosave-model"
import { usePostAutosave } from "@/features/posts/hooks/use-post-autosave"

const storageMocks = vi.hoisted(() => ({
  load: vi.fn<(scope: string) => Promise<LocalPostAutosaveRecord | null>>(),
  save: vi.fn<(record: LocalPostAutosaveRecord) => Promise<boolean>>(),
  remove: vi.fn<(scope: string) => Promise<boolean>>(),
}))

vi.mock("@/features/posts/autosave-storage", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@/features/posts/autosave-storage")
  >()
  return {
    ...actual,
    loadPostAutosave: storageMocks.load,
    savePostAutosave: storageMocks.save,
    deletePostAutosave: storageMocks.remove,
  }
})

const EMPTY_SNAPSHOT: PostAutosaveSnapshot = {
  title: "",
  slug: "",
  content: "",
  coverImage: "",
  tags: [],
}

function response(
  body: { autosave: PostAutosaveRecord | null; code?: string; error?: string },
  status = 200,
) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response
}

async function flushAsyncWork() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
  })
}

function renderAutosave(
  options: {
    snapshot?: PostAutosaveSnapshot
    paused?: boolean
    onRecover?: (snapshot: PostAutosaveSnapshot) => void
  } = {},
) {
  const onRecover = options.onRecover ?? vi.fn()
  return renderHook(
    ({ snapshot, paused }) =>
      usePostAutosave({
        enabled: true,
        postId: null,
        basePostUpdatedAt: null,
        initialSnapshot: EMPTY_SNAPSHOT,
        snapshot,
        paused,
        onRecover,
      }),
    {
      initialProps: {
        snapshot: options.snapshot ?? EMPTY_SNAPSHOT,
        paused: options.paused ?? false,
      },
    },
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  storageMocks.load.mockResolvedValue(null)
  storageMocks.save.mockResolvedValue(true)
  storageMocks.remove.mockResolvedValue(true)
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(response({ autosave: null })),
  )
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("usePostAutosave", () => {
  it("debounces local writes and syncs the latest snapshot to the cloud", async () => {
    const hook = renderAutosave()
    await flushAsyncWork()

    const changed = {
      ...EMPTY_SNAPSHOT,
      title: "自动保存标题",
      content: "自动保存正文",
    }
    hook.rerender({ snapshot: changed, paused: false })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_999)
    })
    expect(storageMocks.save).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(storageMocks.save).toHaveBeenCalledTimes(1)
    expect(storageMocks.save.mock.calls[0]?.[0].snapshot).toEqual(changed)

    const cloudRecord: PostAutosaveRecord = {
      draftId: "11111111-1111-4111-8111-111111111111",
      postId: null,
      basePostUpdatedAt: null,
      version: 1,
      snapshot: changed,
      updatedAt: "2026-08-10T12:00:00.000Z",
    }
    vi.mocked(fetch).mockResolvedValueOnce(
      response({ autosave: cloudRecord }, 201),
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(13_000)
    })

    const putRequest = vi
      .mocked(fetch)
      .mock.calls.find(([, init]) => init?.method === "PUT")
    expect(putRequest).toBeDefined()
    expect(JSON.parse(String(putRequest?.[1]?.body))).toMatchObject({
      postId: null,
      expectedVersion: null,
      snapshot: changed,
    })
    expect(hook.result.current.status).toBe("saved-cloud")
  })

  it("does not persist temporary editor state while an image upload is active", async () => {
    const changed = { ...EMPTY_SNAPSHOT, content: "![上传中](blob:temporary)" }
    const hook = renderAutosave({ snapshot: changed, paused: true })
    await flushAsyncWork()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20_000)
      await hook.result.current.flush()
    })

    expect(storageMocks.save).not.toHaveBeenCalled()
    expect(
      vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === "PUT"),
    ).toHaveLength(0)

    hook.rerender({ snapshot: changed, paused: false })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000)
    })
    expect(storageMocks.save).toHaveBeenCalledTimes(1)
  })

  it("protects unsaved work and flushes it when the page is hidden", async () => {
    const changed = { ...EMPTY_SNAPSHOT, content: "即将离开页面的正文" }
    const hook = renderAutosave({ snapshot: changed })
    await flushAsyncWork()

    const beforeUnload = new Event("beforeunload", {
      cancelable: true,
    }) as BeforeUnloadEvent
    window.dispatchEvent(beforeUnload)
    expect(beforeUnload.defaultPrevented).toBe(true)

    const cloudRecord: PostAutosaveRecord = {
      draftId: "44444444-4444-4444-8444-444444444444",
      postId: null,
      basePostUpdatedAt: null,
      version: 1,
      snapshot: changed,
      updatedAt: "2026-08-10T12:00:00.000Z",
    }
    vi.mocked(fetch).mockResolvedValueOnce(response({ autosave: cloudRecord }, 201))

    act(() => window.dispatchEvent(new Event("pagehide")))
    await flushAsyncWork()

    expect(storageMocks.save).toHaveBeenCalled()
    const putRequest = vi
      .mocked(fetch)
      .mock.calls.find(([, init]) => init?.method === "PUT")
    expect(putRequest?.[1]?.keepalive).toBe(true)
    expect(hook.result.current.status).toBe("saved-cloud")
  })

  it("writes a local recovery copy when client-side navigation unmounts the editor", async () => {
    const changed = { ...EMPTY_SNAPSHOT, title: "刚输入就返回列表" }
    const hook = renderAutosave({ snapshot: changed })
    await flushAsyncWork()

    hook.unmount()
    await flushAsyncWork()

    expect(storageMocks.save).toHaveBeenCalledTimes(1)
    expect(storageMocks.save.mock.calls[0]?.[0].snapshot).toEqual(changed)
  })

  it("offers a newer local working copy for explicit recovery", async () => {
    const onRecover = vi.fn()
    const localRecord: LocalPostAutosaveRecord = {
      scope: "new",
      draftId: "22222222-2222-4222-8222-222222222222",
      postId: null,
      basePostUpdatedAt: null,
      version: null,
      snapshot: { ...EMPTY_SNAPSHOT, title: "本地草稿" },
      updatedAt: "2026-08-10T12:00:00.000Z",
    }
    storageMocks.load.mockResolvedValue(localRecord)

    const hook = renderAutosave({ onRecover })
    await flushAsyncWork()

    expect(hook.result.current.recovery).toMatchObject({ source: "local" })
    act(() => hook.result.current.restoreRecovery())
    expect(onRecover).toHaveBeenCalledWith(localRecord.snapshot)
    expect(hook.result.current.recovery).toBeNull()
    expect(hook.result.current.status).toBe("saved-local")
  })

  it("uses the server version after a competing tab wins an autosave", async () => {
    const hook = renderAutosave()
    await flushAsyncWork()

    const changed = { ...EMPTY_SNAPSHOT, title: "当前标签页" }
    hook.rerender({ snapshot: changed, paused: false })
    await flushAsyncWork()

    const competingRecord: PostAutosaveRecord = {
      draftId: "33333333-3333-4333-8333-333333333333",
      postId: null,
      basePostUpdatedAt: null,
      version: 4,
      snapshot: { ...EMPTY_SNAPSHOT, title: "其他标签页" },
      updatedAt: "2026-08-10T12:00:00.000Z",
    }
    vi.mocked(fetch).mockResolvedValueOnce(
      response(
        {
          autosave: competingRecord,
          code: "AUTOSAVE_CONFLICT",
          error: "自动保存内容已被其他标签页更新",
        },
        409,
      ),
    )

    await act(async () => {
      await hook.result.current.flush()
    })
    expect(hook.result.current.recovery).toMatchObject({
      source: "conflict",
      conflictCode: "AUTOSAVE_CONFLICT",
    })

    act(() => hook.result.current.keepCurrentAfterConflict())
    vi.mocked(fetch).mockResolvedValueOnce(
      response({ autosave: { ...competingRecord, version: 5, snapshot: changed } }),
    )
    await flushAsyncWork()
    await act(async () => {
      await hook.result.current.flush()
    })

    const putRequests = vi
      .mocked(fetch)
      .mock.calls.filter(([, init]) => init?.method === "PUT")
    expect(JSON.parse(String(putRequests.at(-1)?.[1]?.body))).toMatchObject({
      draftId: competingRecord.draftId,
      expectedVersion: 4,
      snapshot: changed,
    })
  })
})
