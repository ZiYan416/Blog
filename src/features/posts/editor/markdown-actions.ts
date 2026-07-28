import type { MarkdownAction } from "@/features/posts/editor/toolbar"

export interface MarkdownEdit {
  text: string
  selectionStart: number
  selectionEnd: number
}

export function applyMarkdownAction(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  action: MarkdownAction
): MarkdownEdit {
  const selectedText = text.substring(selectionStart, selectionEnd)
  const linePrefix =
    selectionStart > 0 && text[selectionStart - 1] !== "\n" ? "\n" : ""
  let before = ""
  let after = ""

  switch (action) {
    case "bold":
      before = "**"
      after = "**"
      break
    case "italic":
      before = "*"
      after = "*"
      break
    case "underline":
      before = "<u>"
      after = "</u>"
      break
    case "highlight":
      before = "=="
      after = "=="
      break
    case "h1":
      before = `${linePrefix}# `
      break
    case "h2":
      before = `${linePrefix}## `
      break
    case "h3":
      before = `${linePrefix}### `
      break
    case "list":
      before = `${linePrefix}- `
      break
    case "ordered-list":
      before = `${linePrefix}1. `
      break
    case "task-list":
      before = `${linePrefix}- [ ] `
      break
    case "quote":
      before = `${linePrefix}> `
      break
    case "code":
      before = "`"
      after = "`"
      break
    case "code-block":
      before = `${linePrefix}\`\`\`\n`
      after = "\n```"
      break
    case "link":
      before = "["
      after = "](url)"
      break
    case "image":
      before = "!["
      after = "](image-url)"
      break
    case "table":
      before = `${linePrefix}| 标题1 | 标题2 | 标题3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n`
      break
    case "hr":
      before = `${linePrefix}\n---\n`
      break
    case "align-left":
    case "align-center":
    case "align-right":
      return { text, selectionStart, selectionEnd }
  }

  const nextText =
    text.substring(0, selectionStart) +
    before +
    selectedText +
    after +
    text.substring(selectionEnd)
  const nextStart = selectionStart + before.length

  return {
    text: nextText,
    selectionStart: nextStart,
    selectionEnd: selectedText ? nextStart + selectedText.length : nextStart,
  }
}
