import {
  normalizePostAutosaveSnapshot,
  type LocalPostAutosaveRecord,
  type PostAutosaveRecord,
} from "@/features/posts/autosave-model"

export const POST_AUTOSAVE_DB_NAME = "blog-editor"
export const POST_AUTOSAVE_DB_VERSION = 1
export const POST_AUTOSAVE_STORE_NAME = "post-autosaves"
export const POST_AUTOSAVE_STORAGE_PREFIX = "blog-editor:post-autosave:v1:"

const NEW_POST_SCOPE = "new"

type UnknownRecord = Record<string, unknown>

function isObject(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null
}

function isCompleteSnapshot(value: unknown): value is UnknownRecord {
  if (!isObject(value)) return false
  return (
    typeof value.title === "string" &&
    typeof value.slug === "string" &&
    typeof value.content === "string" &&
    typeof value.coverImage === "string" &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === "string")
  )
}

/**
 * Existing posts are isolated by their stable database id.  Product scope
 * currently permits one concurrent new-post draft, hence the fixed `new`
 * scope instead of creating an unbounded collection of abandoned drafts.
 */
export function getPostAutosaveScope(postId?: string): string {
  const normalizedPostId = postId?.trim()
  return normalizedPostId ? `existing post:${normalizedPostId}` : NEW_POST_SCOPE
}

export function getPostAutosaveStorageKey(scope: string): string {
  return `${POST_AUTOSAVE_STORAGE_PREFIX}${encodeURIComponent(scope)}`
}

function normalizeLocalRecord(
  value: unknown,
  expectedScope?: string,
): LocalPostAutosaveRecord | null {
  if (!isObject(value)) return null

  const scope = value.scope
  const draftId = value.draftId
  const postId = value.postId
  const basePostUpdatedAt = value.basePostUpdatedAt
  const version = value.version
  const updatedAt = value.updatedAt

  if (
    typeof scope !== "string" ||
    !scope ||
    (expectedScope !== undefined && scope !== expectedScope) ||
    typeof draftId !== "string" ||
    !draftId ||
    !(postId === null || typeof postId === "string") ||
    !(basePostUpdatedAt === null || typeof basePostUpdatedAt === "string") ||
    !(version === null ||
      (typeof version === "number" &&
        Number.isInteger(version) &&
        version >= 0)) ||
    typeof updatedAt !== "string" ||
    !updatedAt ||
    !isCompleteSnapshot(value.snapshot)
  ) {
    return null
  }

  return {
    scope,
    draftId,
    postId,
    basePostUpdatedAt,
    version,
    snapshot: normalizePostAutosaveSnapshot(value.snapshot),
    updatedAt,
  }
}

function canUseIndexedDb() {
  return typeof indexedDB !== "undefined"
}

function getLocalStorage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null
    // Access can throw in privacy mode or an opaque-origin iframe.
    const probe = `${POST_AUTOSAVE_STORAGE_PREFIX}probe`
    localStorage.setItem(probe, "1")
    localStorage.removeItem(probe)
    return localStorage
  } catch {
    return null
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error("IndexedDB is unavailable"))
      return
    }

    let request: IDBOpenDBRequest
    try {
      request = indexedDB.open(
        POST_AUTOSAVE_DB_NAME,
        POST_AUTOSAVE_DB_VERSION,
      )
    } catch (error) {
      reject(error)
      return
    }

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(POST_AUTOSAVE_STORE_NAME)) {
        database.createObjectStore(POST_AUTOSAVE_STORE_NAME, {
          keyPath: "scope",
        })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error("IndexedDB open failed"))
    request.onblocked = () => reject(new Error("IndexedDB open blocked"))
  })
}

function closeDatabase(database: IDBDatabase) {
  try {
    database.close()
  } catch {
    // Closing is best effort and should never surface as a UI error.
  }
}

function readFromIndexedDb(scope: string): Promise<unknown> {
  return openDatabase().then(
    (database) =>
      new Promise((resolve, reject) => {
        let transaction: IDBTransaction | null = null
        try {
          transaction = database.transaction(POST_AUTOSAVE_STORE_NAME, "readonly")
          const currentTransaction = transaction
          const request = currentTransaction
            .objectStore(POST_AUTOSAVE_STORE_NAME)
            .get(scope)
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error || new Error("IndexedDB read failed"))
          currentTransaction.onerror = () =>
            reject(
              currentTransaction.error ||
                new Error("IndexedDB read transaction failed"),
            )
        } catch (error) {
          reject(error)
        } finally {
          // The request result has already been copied by the time the promise
          // resolves. Closing here is safe and avoids retaining connections.
          transaction?.addEventListener("complete", () => closeDatabase(database), {
            once: true,
          })
          transaction?.addEventListener("abort", () => closeDatabase(database), {
            once: true,
          })
        }
      }),
  )
}

function writeToIndexedDb(record: LocalPostAutosaveRecord): Promise<void> {
  return openDatabase().then(
    (database) =>
      new Promise((resolve, reject) => {
        let transaction: IDBTransaction
        try {
          transaction = database.transaction(POST_AUTOSAVE_STORE_NAME, "readwrite")
          const request = transaction
            .objectStore(POST_AUTOSAVE_STORE_NAME)
            .put(record)
          request.onerror = () => reject(request.error || new Error("IndexedDB write failed"))
          transaction.oncomplete = () => {
            closeDatabase(database)
            resolve()
          }
          transaction.onerror = () =>
            reject(transaction.error || new Error("IndexedDB write transaction failed"))
          transaction.onabort = () => reject(new Error("IndexedDB write aborted"))
        } catch (error) {
          closeDatabase(database)
          reject(error)
        }
      }),
  )
}

function deleteFromIndexedDb(scope: string): Promise<void> {
  return openDatabase().then(
    (database) =>
      new Promise((resolve, reject) => {
        let transaction: IDBTransaction
        try {
          transaction = database.transaction(POST_AUTOSAVE_STORE_NAME, "readwrite")
          const request = transaction.objectStore(POST_AUTOSAVE_STORE_NAME).delete(scope)
          request.onerror = () => reject(request.error || new Error("IndexedDB delete failed"))
          transaction.oncomplete = () => {
            closeDatabase(database)
            resolve()
          }
          transaction.onerror = () =>
            reject(transaction.error || new Error("IndexedDB delete transaction failed"))
          transaction.onabort = () => reject(new Error("IndexedDB delete aborted"))
        } catch (error) {
          closeDatabase(database)
          reject(error)
        }
      }),
  )
}

function loadFromLocalStorage(scope: string): LocalPostAutosaveRecord | null {
  const storage = getLocalStorage()
  if (!storage) return null

  const key = getPostAutosaveStorageKey(scope)
  let serialized: string | null
  try {
    serialized = storage.getItem(key)
  } catch {
    return null
  }
  if (!serialized) return null

  try {
    const parsed = normalizeLocalRecord(JSON.parse(serialized), scope)
    if (!parsed) storage.removeItem(key)
    return parsed
  } catch {
    try {
      storage.removeItem(key)
    } catch {
      // Ignore storage cleanup failures.
    }
    return null
  }
}

function saveToLocalStorage(record: LocalPostAutosaveRecord): boolean {
  const storage = getLocalStorage()
  if (!storage) return false

  try {
    storage.setItem(
      getPostAutosaveStorageKey(record.scope),
      JSON.stringify(record),
    )
    return true
  } catch {
    return false
  }
}

function deleteFromLocalStorage(scope: string): boolean {
  const storage = getLocalStorage()
  if (!storage) return false

  try {
    storage.removeItem(getPostAutosaveStorageKey(scope))
    return true
  } catch {
    return false
  }
}

/**
 * Load an autosave without allowing malformed persisted data to escape into
 * React state.  IndexedDB is preferred; localStorage is a recovery backend
 * when IndexedDB is unavailable or has failed.
 */
export async function loadPostAutosave(
  scope: string,
): Promise<LocalPostAutosaveRecord | null> {
  const normalizedScope = scope.trim()
  if (!normalizedScope) return null

  if (canUseIndexedDb()) {
    try {
      const value = await readFromIndexedDb(normalizedScope)
      if (value === undefined) return loadFromLocalStorage(normalizedScope)

      const parsed = normalizeLocalRecord(value, normalizedScope)
      if (!parsed) {
        await deleteFromIndexedDb(normalizedScope).catch(() => undefined)
        return loadFromLocalStorage(normalizedScope)
      }
      return parsed
    } catch {
      // Fall through to the localStorage backend.
    }
  }

  return loadFromLocalStorage(normalizedScope)
}

/**
 * Persist a complete record.  The boolean result intentionally hides backend
 * details so the UI can expose “本地已保存” without coupling to IndexedDB.
 */
export async function savePostAutosave(
  record: LocalPostAutosaveRecord,
): Promise<boolean> {
  const normalized = normalizeLocalRecord(record, record.scope)
  if (!normalized) return false

  if (canUseIndexedDb()) {
    try {
      await writeToIndexedDb(normalized)
      // Remove a stale fallback copy once the preferred backend recovers.
      deleteFromLocalStorage(normalized.scope)
      return true
    } catch {
      // Fall through to localStorage.
    }
  }

  return saveToLocalStorage(normalized)
}

export async function deletePostAutosave(scope: string): Promise<boolean> {
  const normalizedScope = scope.trim()
  if (!normalizedScope) return false

  let succeeded = false
  if (canUseIndexedDb()) {
    try {
      await deleteFromIndexedDb(normalizedScope)
      succeeded = true
    } catch {
      // Continue to clear any fallback copy.
    }
  }

  return deleteFromLocalStorage(normalizedScope) || succeeded
}

/** Build a persisted record while keeping all fields explicit. */
export function createLocalPostAutosaveRecord(
  scope: string,
  record: PostAutosaveRecord,
): LocalPostAutosaveRecord {
  return {
    scope,
    draftId: record.draftId,
    postId: record.postId,
    basePostUpdatedAt: record.basePostUpdatedAt,
    version: record.version,
    snapshot: normalizePostAutosaveSnapshot(record.snapshot),
    updatedAt: record.updatedAt,
  }
}
