"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"

import {
  arePostAutosaveSnapshotsEqual,
  isMeaningfulPostAutosaveSnapshot,
  normalizePostAutosaveSnapshot,
  serializePostAutosaveSnapshot,
  type PostAutosaveRecord,
  type PostAutosaveSnapshot,
} from "@/features/posts/autosave-model"
import {
  createLocalPostAutosaveRecord,
  deletePostAutosave,
  getPostAutosaveScope,
  loadPostAutosave,
  savePostAutosave,
} from "@/features/posts/autosave-storage"

const LOCAL_SAVE_DELAY_MS = 2_000
const CLOUD_SAVE_INTERVAL_MS = 15_000

export type PostAutosaveStatus =
  | "loading"
  | "idle"
  | "unsaved"
  | "saving-local"
  | "saved-local"
  | "saving-cloud"
  | "saved-cloud"
  | "offline"
  | "conflict"
  | "error"

export interface PostAutosaveRecovery {
  record: PostAutosaveRecord
  source: "local" | "cloud" | "conflict"
  conflictCode?: "AUTOSAVE_CONFLICT" | "POST_VERSION_CONFLICT"
}

interface UsePostAutosaveOptions {
  enabled: boolean
  postId: string | null
  basePostUpdatedAt: string | null
  initialSnapshot: PostAutosaveSnapshot
  snapshot: PostAutosaveSnapshot
  paused: boolean
  onRecover: (snapshot: PostAutosaveSnapshot) => void
}

interface AutosaveResponse {
  autosave: PostAutosaveRecord | null
  code?: "AUTOSAVE_CONFLICT" | "POST_VERSION_CONFLICT"
  error?: string
}

function createDraftId() {
  return uuidv4()
}

function toTimestamp(value: string) {
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function isOfflineError(error: unknown) {
  return (
    (typeof navigator !== "undefined" && !navigator.onLine) ||
    error instanceof TypeError
  )
}

async function readResponse(response: Response): Promise<AutosaveResponse> {
  const result = (await response.json().catch(() => ({}))) as AutosaveResponse
  if (!response.ok) {
    const error = new Error(result.error || "自动保存失败")
    Object.assign(error, { status: response.status, result })
    throw error
  }
  return result
}

function getRequestError(error: unknown) {
  return error as Error & { status?: number; result?: AutosaveResponse }
}

export function usePostAutosave({
  enabled,
  postId,
  basePostUpdatedAt,
  initialSnapshot,
  snapshot,
  paused,
  onRecover,
}: UsePostAutosaveOptions) {
  const scope = useMemo(
    () => getPostAutosaveScope(postId || undefined),
    [postId],
  )
  const normalizedSnapshot = useMemo(
    () => normalizePostAutosaveSnapshot(snapshot),
    [snapshot],
  )
  const currentHash = useMemo(
    () => serializePostAutosaveSnapshot(normalizedSnapshot),
    [normalizedSnapshot],
  )
  const initialHash = useMemo(
    () => serializePostAutosaveSnapshot(initialSnapshot),
    [initialSnapshot],
  )

  const [status, setStatus] = useState<PostAutosaveStatus>(
    enabled ? "loading" : "idle",
  )
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [recovery, setRecovery] = useState<PostAutosaveRecovery | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const snapshotRef = useRef(normalizedSnapshot)
  const currentHashRef = useRef(currentHash)
  const pausedRef = useRef(paused)
  const recoveryRef = useRef<PostAutosaveRecovery | null>(null)
  const metadataRef = useRef<{
    draftId: string
    version: number | null
    basePostUpdatedAt: string | null
  }>({
    draftId: createDraftId(),
    version: null,
    basePostUpdatedAt,
  })
  const localAcknowledgedHashRef = useRef(initialHash)
  const cloudAcknowledgedHashRef = useRef(initialHash)
  const inFlightRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const generationRef = useRef(0)

  useEffect(() => {
    snapshotRef.current = normalizedSnapshot
    currentHashRef.current = currentHash
    pausedRef.current = paused
    recoveryRef.current = recovery
  }, [currentHash, normalizedSnapshot, paused, recovery])

  const persistLocal = useCallback(
    async (recordSnapshot = snapshotRef.current) => {
      if (!enabled || pausedRef.current || recoveryRef.current) return false
      if (
        !postId &&
        !isMeaningfulPostAutosaveSnapshot(recordSnapshot)
      ) {
        return false
      }

      setStatus("saving-local")
      const now = new Date().toISOString()
      const metadata = metadataRef.current
      const record = createLocalPostAutosaveRecord(scope, {
        draftId: metadata.draftId,
        postId,
        basePostUpdatedAt: metadata.basePostUpdatedAt,
        version: metadata.version,
        snapshot: recordSnapshot,
        updatedAt: now,
      })
      const succeeded = await savePostAutosave(record)
      if (!succeeded) {
        setStatus("error")
        return false
      }

      localAcknowledgedHashRef.current =
        serializePostAutosaveSnapshot(recordSnapshot)
      setSavedAt(now)
      setStatus(
        localAcknowledgedHashRef.current === cloudAcknowledgedHashRef.current
          ? "saved-cloud"
          : "saved-local",
      )
      return true
    },
    [enabled, postId, scope],
  )

  const syncCloud = useCallback(
    async ({ keepalive = false }: { keepalive?: boolean } = {}) => {
      if (
        !enabled ||
        !hydrated ||
        pausedRef.current ||
        recoveryRef.current ||
        inFlightRef.current ||
        currentHashRef.current === cloudAcknowledgedHashRef.current ||
        (!postId &&
          !isMeaningfulPostAutosaveSnapshot(snapshotRef.current))
      ) {
        return false
      }

      const requestGeneration = generationRef.current
      const requestSnapshot = snapshotRef.current
      const requestHash = serializePostAutosaveSnapshot(requestSnapshot)
      const controller = new AbortController()
      abortControllerRef.current = controller
      inFlightRef.current = true
      setStatus("saving-cloud")

      try {
        const metadata = metadataRef.current
        const response = await fetch("/api/posts/autosave", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draftId: metadata.draftId,
            postId,
            basePostUpdatedAt: metadata.basePostUpdatedAt,
            expectedVersion: metadata.version,
            snapshot: requestSnapshot,
          }),
          keepalive,
          signal: controller.signal,
        })
        const result = await readResponse(response)
        if (generationRef.current !== requestGeneration || !result.autosave) {
          return false
        }

        metadataRef.current = {
          draftId: result.autosave.draftId,
          version: result.autosave.version,
          basePostUpdatedAt: result.autosave.basePostUpdatedAt,
        }
        cloudAcknowledgedHashRef.current = requestHash
        const completedAt = result.autosave.updatedAt
        setSavedAt(completedAt)
        setStatus(
          currentHashRef.current === requestHash ? "saved-cloud" : "unsaved",
        )

        await persistLocal(snapshotRef.current)
        return true
      } catch (error) {
        if (controller.signal.aborted || generationRef.current !== requestGeneration) {
          return false
        }

        const requestError = getRequestError(error)
        if (requestError.status === 409) {
          const conflictRecord = requestError.result?.autosave
          setRecovery(
            conflictRecord
              ? {
                  record: conflictRecord,
                  source: "conflict",
                  conflictCode: requestError.result?.code,
                }
              : {
                  record: {
                    draftId: metadataRef.current.draftId,
                    postId,
                    basePostUpdatedAt: metadataRef.current.basePostUpdatedAt,
                    version: metadataRef.current.version,
                    snapshot: snapshotRef.current,
                    updatedAt: new Date().toISOString(),
                  },
                  source: "conflict",
                  conflictCode: requestError.result?.code,
                },
          )
          setStatus("conflict")
          return false
        }

        await persistLocal(requestSnapshot)
        setStatus(isOfflineError(error) ? "offline" : "error")
        return false
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null
        }
        inFlightRef.current = false
      }
    },
    [enabled, hydrated, persistLocal, postId],
  )

  useEffect(() => {
    if (!enabled) return

    const requestGeneration = ++generationRef.current
    let cancelled = false
    localAcknowledgedHashRef.current = initialHash
    cloudAcknowledgedHashRef.current = initialHash
    metadataRef.current = {
      draftId: createDraftId(),
      version: null,
      basePostUpdatedAt,
    }

    const hydrate = async () => {
      const local = await loadPostAutosave(scope)
      const query = postId
        ? `postId=${encodeURIComponent(postId)}`
        : local
          ? `draftId=${encodeURIComponent(local.draftId)}`
          : "latestNew=true"
      let cloud: PostAutosaveRecord | null = null
      let cloudUnavailable = false
      let cloudError = false

      try {
        const response = await fetch(`/api/posts/autosave?${query}`, {
          cache: "no-store",
        })
        const result = await readResponse(response)
        cloud = result.autosave
      } catch (error) {
        cloudUnavailable = isOfflineError(error)
        cloudError = !cloudUnavailable
      }

      if (
        cancelled ||
        generationRef.current !== requestGeneration
      ) {
        return
      }

      const cloudHash = cloud
        ? serializePostAutosaveSnapshot(cloud.snapshot)
        : initialHash
      const localIsNewer =
        local && (!cloud || toTimestamp(local.updatedAt) > toTimestamp(cloud.updatedAt))
      const selected = localIsNewer ? local : cloud

      if (cloud) {
        metadataRef.current = {
          draftId: cloud.draftId,
          version: cloud.version,
          basePostUpdatedAt: cloud.basePostUpdatedAt,
        }
        cloudAcknowledgedHashRef.current = cloudHash
      } else if (local) {
        metadataRef.current = {
          draftId: local.draftId,
          version: local.version,
          basePostUpdatedAt: local.basePostUpdatedAt,
        }
      }

      if (local && cloud && localIsNewer) {
        metadataRef.current = {
          draftId: cloud.draftId,
          version: cloud.version,
          basePostUpdatedAt: cloud.basePostUpdatedAt,
        }
      }

      if (selected) {
        localAcknowledgedHashRef.current = serializePostAutosaveSnapshot(
          selected.snapshot,
        )
        setSavedAt(selected.updatedAt)
      }

      if (
        selected &&
        !arePostAutosaveSnapshotsEqual(selected.snapshot, initialSnapshot)
      ) {
        const selectedRecord: PostAutosaveRecord = {
          ...selected,
          draftId: metadataRef.current.draftId,
          version: metadataRef.current.version,
          basePostUpdatedAt: metadataRef.current.basePostUpdatedAt,
        }
        setRecovery({
          record: selectedRecord,
          source: localIsNewer ? "local" : "cloud",
        })
        setStatus("conflict")
      } else {
        setStatus(
          cloudError
            ? "error"
            : cloudUnavailable
            ? local
              ? "offline"
              : "idle"
            : cloud
              ? "saved-cloud"
              : "idle",
        )
      }
      setHydrated(true)
    }

    void hydrate()
    return () => {
      cancelled = true
      abortControllerRef.current?.abort()
    }
  }, [basePostUpdatedAt, enabled, initialHash, initialSnapshot, postId, scope])

  useEffect(() => {
    if (
      !enabled ||
      !hydrated ||
      paused ||
      recovery ||
      currentHash === localAcknowledgedHashRef.current
    ) {
      return
    }

    queueMicrotask(() => setStatus("unsaved"))
    const timer = window.setTimeout(() => {
      void persistLocal()
    }, LOCAL_SAVE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [currentHash, enabled, hydrated, paused, persistLocal, recovery])

  useEffect(() => {
    if (!enabled || !hydrated) return
    const timer = window.setInterval(() => {
      void syncCloud()
    }, CLOUD_SAVE_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [enabled, hydrated, syncCloud])

  useEffect(() => {
    if (!enabled || !hydrated) return

    const flush = () => {
      void persistLocal()
      void syncCloud({ keepalive: true })
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush()
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (
        currentHashRef.current !== localAcknowledgedHashRef.current ||
        (pausedRef.current &&
          isMeaningfulPostAutosaveSnapshot(snapshotRef.current))
      ) {
        event.preventDefault()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("pagehide", flush)
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("pagehide", flush)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [enabled, hydrated, persistLocal, syncCloud])

  useEffect(() => {
    if (!enabled || !hydrated) return

    return () => {
      const recordSnapshot = snapshotRef.current
      if (
        pausedRef.current ||
        recoveryRef.current ||
        currentHashRef.current === localAcknowledgedHashRef.current ||
        (!postId && !isMeaningfulPostAutosaveSnapshot(recordSnapshot))
      ) {
        return
      }

      const metadata = metadataRef.current
      void savePostAutosave(
        createLocalPostAutosaveRecord(scope, {
          draftId: metadata.draftId,
          postId,
          basePostUpdatedAt: metadata.basePostUpdatedAt,
          version: metadata.version,
          snapshot: recordSnapshot,
          updatedAt: new Date().toISOString(),
        }),
      )
    }
  }, [enabled, hydrated, postId, scope])

  const restoreRecovery = useCallback(() => {
    const currentRecovery = recoveryRef.current
    if (!currentRecovery) return
    const recoveryHash = serializePostAutosaveSnapshot(
      currentRecovery.record.snapshot,
    )
    metadataRef.current = {
      draftId: currentRecovery.record.draftId,
      version: currentRecovery.record.version,
      basePostUpdatedAt: postId
        ? basePostUpdatedAt
        : currentRecovery.record.basePostUpdatedAt,
    }
    localAcknowledgedHashRef.current = recoveryHash
    if (currentRecovery.source !== "local") {
      cloudAcknowledgedHashRef.current = recoveryHash
    }
    onRecover(currentRecovery.record.snapshot)
    setRecovery(null)
    setSavedAt(currentRecovery.record.updatedAt)
    setStatus(
      cloudAcknowledgedHashRef.current === recoveryHash
        ? "saved-cloud"
        : "saved-local",
    )
  }, [basePostUpdatedAt, onRecover, postId])

  const keepCurrentAfterConflict = useCallback(() => {
    const currentRecovery = recoveryRef.current
    if (!currentRecovery || currentRecovery.conflictCode !== "AUTOSAVE_CONFLICT") {
      return
    }
    metadataRef.current = {
      draftId: currentRecovery.record.draftId,
      version: currentRecovery.record.version,
      basePostUpdatedAt: currentRecovery.record.basePostUpdatedAt,
    }
    cloudAcknowledgedHashRef.current = serializePostAutosaveSnapshot(
      currentRecovery.record.snapshot,
    )
    setRecovery(null)
    setStatus("unsaved")
  }, [])

  const discardRecovery = useCallback(async () => {
    const currentRecovery = recoveryRef.current
    setRecovery(null)
    generationRef.current += 1
    abortControllerRef.current?.abort()
    await deletePostAutosave(scope)
    if (currentRecovery?.record.draftId) {
      await fetch(
        `/api/posts/autosave?draftId=${encodeURIComponent(currentRecovery.record.draftId)}`,
        { method: "DELETE", keepalive: true },
      ).catch(() => undefined)
    }
    metadataRef.current = {
      draftId: createDraftId(),
      version: null,
      basePostUpdatedAt,
    }
    localAcknowledgedHashRef.current = currentHashRef.current
    cloudAcknowledgedHashRef.current = currentHashRef.current
    setSavedAt(null)
    setStatus("idle")
  }, [basePostUpdatedAt, scope])

  const clearAutosave = useCallback(async () => {
    const draftId = metadataRef.current.draftId
    generationRef.current += 1
    abortControllerRef.current?.abort()
    inFlightRef.current = false
    const localCleared = await deletePostAutosave(scope)
    let cloudCleared = true
    try {
      const response = await fetch(
        `/api/posts/autosave?draftId=${encodeURIComponent(draftId)}`,
        { method: "DELETE", keepalive: true },
      )
      cloudCleared = response.ok
    } catch {
      cloudCleared = false
    }
    localAcknowledgedHashRef.current = currentHashRef.current
    cloudAcknowledgedHashRef.current = currentHashRef.current
    setRecovery(null)
    setStatus("idle")
    return localCleared && cloudCleared
  }, [scope])

  return {
    status,
    savedAt,
    recovery,
    restoreRecovery,
    keepCurrentAfterConflict,
    discardRecovery,
    clearAutosave,
    flush: syncCloud,
  }
}
