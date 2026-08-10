// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  arePostAutosaveSnapshotsEqual,
  isMeaningfulPostAutosaveSnapshot,
  normalizePostAutosaveSnapshot,
  serializePostAutosaveSnapshot,
  type LocalPostAutosaveRecord,
} from "@/features/posts/autosave-model"
import {
  deletePostAutosave,
  getPostAutosaveScope,
  getPostAutosaveStorageKey,
  loadPostAutosave,
  savePostAutosave,
} from "@/features/posts/autosave-storage"

function createRecord(
  overrides: Partial<LocalPostAutosaveRecord> = {},
): LocalPostAutosaveRecord {
  return {
    scope: "new",
    draftId: "draft-1",
    postId: null,
    basePostUpdatedAt: null,
    version: null,
    snapshot: {
      title: "标题",
      slug: "title",
      content: "正文",
      coverImage: "",
      tags: ["教程"],
    },
    updatedAt: "2026-08-10T00:00:00.000Z",
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
  // jsdom does not implement IndexedDB. Explicitly stubbing it keeps this
  // suite deterministic even when the runner is configured with a polyfill.
  vi.stubGlobal("indexedDB", undefined)
})

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe("post autosave snapshot model", () => {
  it("normalizes text and makes tag ordering deterministic", () => {
    const snapshot = normalizePostAutosaveSnapshot({
      title: "  标题  ",
      slug: " title ",
      content: "正文",
      coverImage: " https://img.test/cover.png ",
      tags: ["教程", "Next.js", "教程", "  ", "Next.js"],
    })

    expect(snapshot).toEqual({
      title: "标题",
      slug: "title",
      content: "正文",
      coverImage: "https://img.test/cover.png",
      tags: ["Next.js", "教程"],
    })
  })

  it("serializes equivalent snapshots identically", () => {
    const left = {
      title: "标题",
      slug: "title",
      content: "正文",
      coverImage: "",
      tags: ["教程", "Next.js"],
    }
    const right = {
      content: "正文",
      tags: ["Next.js", "教程", "教程"],
      coverImage: "",
      slug: "title",
      title: "标题",
    }

    expect(serializePostAutosaveSnapshot(left)).toBe(
      serializePostAutosaveSnapshot(right),
    )
    expect(arePostAutosaveSnapshotsEqual(left, right)).toBe(true)
  })

  it("does not treat an empty new form as meaningful work", () => {
    expect(
      isMeaningfulPostAutosaveSnapshot({
        title: "  ",
        slug: "",
        content: "\n  ",
        coverImage: "",
        tags: [],
      }),
    ).toBe(false)
    expect(
      isMeaningfulPostAutosaveSnapshot({
        title: "",
        slug: "",
        content: "",
        coverImage: "https://img.test/cover.png",
        tags: [],
      }),
    ).toBe(true)
  })
})

describe("post autosave localStorage fallback", () => {
  it("round-trips a complete record when IndexedDB is unavailable", async () => {
    const record = createRecord({
      postId: "post-1",
      basePostUpdatedAt: "2026-08-09T00:00:00.000Z",
      version: 3,
    })

    expect(await savePostAutosave(record)).toBe(true)
    await expect(loadPostAutosave("new")).resolves.toEqual(record)
  })

  it("uses a stable scope and a versioned storage key", () => {
    expect(getPostAutosaveScope()).toBe("new")
    expect(getPostAutosaveScope("  post-1 ")).toBe("existing post:post-1")
    expect(getPostAutosaveStorageKey("new")).toContain(
      "blog-editor:post-autosave:v1:",
    )
  })

  it("clears malformed data instead of throwing", async () => {
    const key = getPostAutosaveStorageKey("new")
    localStorage.setItem(key, "{not valid json")

    await expect(loadPostAutosave("new")).resolves.toBeNull()
    expect(localStorage.getItem(key)).toBeNull()

    localStorage.setItem(
      key,
      JSON.stringify({
        scope: "new",
        draftId: "draft-1",
        snapshot: { title: "missing required fields" },
      }),
    )
    await expect(loadPostAutosave("new")).resolves.toBeNull()
    expect(localStorage.getItem(key)).toBeNull()
  })

  it("deletes a persisted record", async () => {
    const record = createRecord()
    await savePostAutosave(record)
    await expect(deletePostAutosave(record.scope)).resolves.toBe(true)
    await expect(loadPostAutosave(record.scope)).resolves.toBeNull()
  })
})
