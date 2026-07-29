// @vitest-environment jsdom

import { cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { RichEditor } from "../src/features/posts/editor/rich-editor"

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    }
  )
  HTMLElement.prototype.scrollTo = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("RichEditor lifecycle", () => {
  it("unmounts linked content without triggering nested flushSync", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    const view = render(
      <RichEditor
        content="[示例链接](https://example.com)"
        onChange={vi.fn()}
        onEditorReady={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(view.container.querySelector(".editor-link")).not.toBeNull()
    })

    view.unmount()
    await new Promise((resolve) => window.setTimeout(resolve, 10))

    expect(
      consoleError.mock.calls.some((call) =>
        call.some(
          (value) =>
            typeof value === "string" &&
            value.includes("flushSync was called from inside a lifecycle method")
        )
      )
    ).toBe(false)
  })
})
