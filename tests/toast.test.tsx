// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  DEFAULT_TOAST_DURATION,
  DESTRUCTIVE_TOAST_DURATION,
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { reducer, toast } from "@/hooks/use-toast"

afterEach(() => cleanup())

describe("Toast primitives", () => {
  it("renders messages created before the Toaster subscribes", () => {
    const pendingToast = toast({ title: "挂载前消息" })

    render(<Toaster />)

    expect(screen.getByText("挂载前消息")).toBeTruthy()
    pendingToast.dismiss()
  })

  it("renders each semantic variant with its motion-reduced styles", () => {
    for (const variant of ["default", "success", "info", "warning", "destructive"] as const) {
      const { unmount } = render(
        <ToastProvider>
          <Toast open variant={variant} data-testid={`toast-${variant}`}>
            <ToastTitle>{variant}</ToastTitle>
            <ToastDescription>消息内容</ToastDescription>
            <ToastClose />
          </Toast>
          <ToastViewport />
        </ToastProvider>,
      )

      const toast = screen.getByTestId(`toast-${variant}`)
      expect(toast.className).toContain("motion-reduce:animate-none")
      if (variant !== "default") {
        expect(toast.className).toContain(
          variant === "destructive" ? "bg-destructive" : `bg-${variant === "success" ? "emerald" : variant === "info" ? "sky" : "amber"}-50`,
        )
      }
      unmount()
    }
  })

  it("provides a Chinese accessible name and visible keyboard focus style", () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>提示</ToastTitle>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    )

    const close = screen.getByRole("button", { name: "关闭消息" })
    expect(close.className).toContain("focus-visible:ring-2")
    expect(close.querySelector(".sr-only")?.textContent).toBe("关闭消息")
  })

  it("uses readable default durations and keeps destructive messages longer", () => {
    expect(DEFAULT_TOAST_DURATION).toBeGreaterThan(2000)
    expect(DESTRUCTIVE_TOAST_DURATION).toBeGreaterThan(DEFAULT_TOAST_DURATION)
  })
})

describe("toast reducer", () => {
  it("applies partial updates without scheduling side effects", () => {
    const initial = {
      toasts: [
        {
          id: "toast-1",
          title: "旧标题",
          description: "说明",
          open: true,
          variant: "default" as const,
        },
      ],
    }

    const updated = reducer(initial, {
      type: "UPDATE_TOAST",
      toast: { id: "toast-1", title: "新标题" },
    })

    expect(updated.toasts[0]).toMatchObject({
      id: "toast-1",
      title: "新标题",
      description: "说明",
      open: true,
    })
  })

  it("only marks a toast closed when dismissed", () => {
    const initial = {
      toasts: [
        {
          id: "toast-1",
          title: "提示",
          open: true,
        },
      ],
    }

    const dismissed = reducer(initial, {
      type: "DISMISS_TOAST",
      toastId: "toast-1",
    })

    expect(dismissed.toasts).toEqual([
      expect.objectContaining({ id: "toast-1", open: false }),
    ])
    expect(initial.toasts[0].open).toBe(true)
  })
})
