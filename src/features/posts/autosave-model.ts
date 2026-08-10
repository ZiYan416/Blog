/**
 * The fields that describe an editor draft.  Derived values such as excerpt
 * and published state deliberately do not belong in a local autosave.
 */
export interface PostAutosaveSnapshot {
  title: string
  slug: string
  content: string
  coverImage: string
  tags: string[]
}

export interface PostAutosaveRecord {
  draftId: string
  postId: string | null
  basePostUpdatedAt: string | null
  version: number | null
  snapshot: PostAutosaveSnapshot
  updatedAt: string
}

export interface LocalPostAutosaveRecord extends PostAutosaveRecord {
  /** IndexedDB's keyPath and the localStorage namespace. */
  scope: string
}

type SnapshotInput = Partial<PostAutosaveSnapshot> | null | undefined

/**
 * Normalise editor values before comparing or persisting them.
 *
 * Tags are not ordered data in the post model, so empty values are removed,
 * duplicates are collapsed, and the remaining values are sorted.  Keeping
 * this logic here makes dirty checks deterministic across reloads and tabs.
 */
export function normalizePostAutosaveSnapshot(
  input: SnapshotInput,
): PostAutosaveSnapshot {
  const tags = Array.isArray(input?.tags)
    ? input.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []

  return {
    title: typeof input?.title === "string" ? input.title.trim() : "",
    slug: typeof input?.slug === "string" ? input.slug.trim() : "",
    content: typeof input?.content === "string" ? input.content : "",
    coverImage:
      typeof input?.coverImage === "string" ? input.coverImage.trim() : "",
    tags: [...new Set(tags)].sort(),
  }
}

/**
 * A stable representation used for dirty checks and request de-duplication.
 * Object keys are written in an explicit order instead of relying on caller
 * supplied object ordering.
 */
export function serializePostAutosaveSnapshot(
  snapshot: SnapshotInput,
): string {
  const normalized = normalizePostAutosaveSnapshot(snapshot)
  return JSON.stringify({
    title: normalized.title,
    slug: normalized.slug,
    content: normalized.content,
    coverImage: normalized.coverImage,
    tags: normalized.tags,
  })
}

export function arePostAutosaveSnapshotsEqual(
  left: SnapshotInput,
  right: SnapshotInput,
): boolean {
  return serializePostAutosaveSnapshot(left) ===
    serializePostAutosaveSnapshot(right)
}

/**
 * Empty new forms should not create a cloud row or a noisy local record.
 * Whitespace-only title/content are treated as empty, while a cover or tag
 * still counts as meaningful because it represents user work that must not be
 * lost.
 */
export function isMeaningfulPostAutosaveSnapshot(
  snapshot: SnapshotInput,
): boolean {
  const normalized = normalizePostAutosaveSnapshot(snapshot)
  return Boolean(
    normalized.title ||
      normalized.slug ||
      normalized.content.trim() ||
      normalized.coverImage ||
      normalized.tags.length,
  )
}
