"use client"

import * as React from "react"

import {
  DESTRUCTIVE_TOAST_DURATION,
  DEFAULT_TOAST_DURATION,
  getToastDuration,
  type ToastActionElement,
  type ToastProps,
} from "@/components/ui/toast"

export const TOAST_LIMIT = 3

// Keep the root mounted briefly after it is dismissed so the exit animation
// can finish. The visible duration is configured on each Toast root.
export const TOAST_REMOVE_DELAY = 300

export type ToastVariant = NonNullable<ToastProps["variant"]>

// Radix's Root also exposes a string-only `title` prop for native
// accessibility. The store supports ReactNode titles, so replace that
// intersection with our wider type instead of narrowing it accidentally.
export type ToasterToast = Omit<ToastProps, "title"> & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

export type ToastInput = Omit<
  ToasterToast,
  "id" | "open" | "onOpenChange"
>

export type ToastUpdate = Partial<ToastInput>

type Action =
  | {
      type: "ADD_TOAST"
      toast: ToasterToast
    }
  | {
      type: "UPDATE_TOAST"
      toast: Partial<ToasterToast> & Pick<ToasterToast, "id">
    }
  | {
      type: "DISMISS_TOAST"
      toastId?: ToasterToast["id"]
    }
  | {
      type: "REMOVE_TOAST"
      toastId?: ToasterToast["id"]
    }

export interface ToastState {
  toasts: ToasterToast[]
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

/**
 * Pure state transition for the toast store. Queueing removal is intentionally
 * handled by dispatch instead of this reducer, so reducer calls stay safe in
 * tests, strict mode and server rendering.
 */
export const reducer = (state: ToastState, action: Action): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toast.id === action.toast.id
            ? { ...toast, ...action.toast }
            : toast
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toastId === undefined || toast.id === toastId
            ? { ...toast, open: false }
            : toast
        ),
      }
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return { ...state, toasts: [] }
      }

      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.toastId),
      }
  }
}

const EMPTY_TOAST_STATE: ToastState = { toasts: [] }
const listeners = new Set<() => void>()
let memoryState: ToastState = EMPTY_TOAST_STATE
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return memoryState
}

function getServerSnapshot() {
  return EMPTY_TOAST_STATE
}

function addToRemoveQueue(toastId: string) {
  if (toastTimeouts.has(toastId)) return

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

function clearRemovalTimeout(toastId: string) {
  const timeout = toastTimeouts.get(toastId)
  if (!timeout) return

  clearTimeout(timeout)
  toastTimeouts.delete(toastId)
}

function dispatch(action: Action) {
  // Side effects belong at the store boundary, not in reducer(). Queue only
  // toasts that currently exist; this also keeps repeated dismiss calls safe.
  if (action.type === "DISMISS_TOAST") {
    const ids = action.toastId
      ? [action.toastId]
      : memoryState.toasts.map((toast) => toast.id)
    ids.forEach(addToRemoveQueue)
  }

  if (action.type === "REMOVE_TOAST") {
    if (action.toastId) {
      clearRemovalTimeout(action.toastId)
    } else {
      toastTimeouts.forEach((_, toastId) => clearRemovalTimeout(toastId))
    }
  }

  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener())
}

export interface ToastResult {
  id: string
  dismiss: () => void
  update: (props: ToastUpdate) => void
}

function createToast({ ...props }: ToastInput): ToastResult {
  const id = genId()
  const variant = props.variant
  const duration = props.duration ?? getToastDuration(variant)

  const update = (nextProps: ToastUpdate) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...nextProps, id },
    })

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      duration,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return { id, dismiss, update }
}

type ConvenienceOptions = Omit<ToastInput, "title" | "variant"> & {
  title?: React.ReactNode
}

export interface ToastFunction {
  (props: ToastInput): ToastResult
  success(message: React.ReactNode, options?: ConvenienceOptions): ToastResult
  info(message: React.ReactNode, options?: ConvenienceOptions): ToastResult
  warning(message: React.ReactNode, options?: ConvenienceOptions): ToastResult
  destructive(message: React.ReactNode, options?: ConvenienceOptions): ToastResult
  error(message: React.ReactNode, options?: ConvenienceOptions): ToastResult
}

function createConvenienceToast(
  variant: ToastVariant,
  message: React.ReactNode,
  options: ConvenienceOptions = {}
) {
  return createToast({
    ...options,
    title: options.title ?? message,
    variant,
  })
}

export const toast: ToastFunction = Object.assign(createToast, {
  success: (message: React.ReactNode, options?: ConvenienceOptions) =>
    createConvenienceToast("success", message, options),
  info: (message: React.ReactNode, options?: ConvenienceOptions) =>
    createConvenienceToast("info", message, options),
  warning: (message: React.ReactNode, options?: ConvenienceOptions) =>
    createConvenienceToast("warning", message, options),
  destructive: (message: React.ReactNode, options?: ConvenienceOptions) =>
    createConvenienceToast("destructive", message, options),
  error: (message: React.ReactNode, options?: ConvenienceOptions) =>
    createConvenienceToast("destructive", message, options),
})

function useToast() {
  const state = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export {
  DEFAULT_TOAST_DURATION,
  DESTRUCTIVE_TOAST_DURATION,
  useToast,
}
