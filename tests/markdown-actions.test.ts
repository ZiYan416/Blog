import { describe, expect, it } from "vitest"
import { applyMarkdownAction } from "../src/features/posts/editor/markdown-actions"

describe("applyMarkdownAction", () => {
  it("wraps the current selection and preserves the selected range", () => {
    expect(applyMarkdownAction("hello world", 6, 11, "bold")).toEqual({
      text: "hello **world**",
      selectionStart: 8,
      selectionEnd: 13,
    })
  })

  it("moves block syntax to a new line when editing mid-line", () => {
    expect(applyMarkdownAction("introtitle", 5, 10, "h2")).toEqual({
      text: "intro\n## title",
      selectionStart: 9,
      selectionEnd: 14,
    })
  })

  it("leaves source text unchanged for rich-editor-only alignment actions", () => {
    expect(applyMarkdownAction("text", 0, 4, "align-center")).toEqual({
      text: "text",
      selectionStart: 0,
      selectionEnd: 4,
    })
  })
})
