// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import type { Editor } from "@tiptap/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { EditorContextMenu } from "../src/features/posts/editor/editor-context-menu"

afterEach(cleanup)

function createEditorMock(onCommand: (command: string) => void) {
  const commandNames = [
    "addRowBefore",
    "addRowAfter",
    "deleteRow",
    "addColumnBefore",
    "addColumnAfter",
    "deleteColumn",
    "toggleHeaderRow",
    "mergeCells",
    "splitCell",
    "deleteTable",
    "undo",
    "redo",
    "deleteSelection",
    "selectAll",
    "setParagraph",
    "toggleHeading",
    "toggleBold",
    "toggleItalic",
    "toggleCode",
    "toggleBulletList",
    "toggleOrderedList",
    "toggleBlockquote",
    "insertContent",
    "insertTable",
    "setHorizontalRule",
  ] as const

  const createChain = () => {
    let selectedCommand = ""
    const chain = {
      focus: () => chain,
      run: () => {
        onCommand(selectedCommand)
        return true
      },
    } as Record<string, () => unknown>

    for (const commandName of commandNames) {
      chain[commandName] = () => {
        selectedCommand = commandName
        return chain
      }
    }

    return chain
  }

  const can = Object.fromEntries(
    commandNames.map((commandName) => [commandName, () => true])
  )

  return {
    chain: createChain,
    can: () => can,
    isActive: (name: string) => name === "table",
    state: {
      selection: { empty: false, from: 1, to: 2 },
      doc: { textBetween: () => "选中文本" },
    },
  } as unknown as Editor
}

describe("EditorContextMenu", () => {
  it("runs the current-row deletion command and closes the menu", async () => {
    const onCommand = vi.fn()
    const onClose = vi.fn()

    render(
      <EditorContextMenu
        editor={createEditorMock(onCommand)}
        position={{ x: 20, y: 30 }}
        onClose={onClose}
        onClipboardError={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole("menuitem", { name: "删除当前行" }))

    expect(onCommand).toHaveBeenCalledWith("deleteRow")
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
  })

  it("includes row, column, cell and whole-table operations", () => {
    render(
      <EditorContextMenu
        editor={createEditorMock(vi.fn())}
        position={{ x: 20, y: 30 }}
        onClose={vi.fn()}
        onClipboardError={vi.fn()}
      />
    )

    expect(screen.getByRole("menuitem", { name: "在上方插入行" })).toBeTruthy()
    expect(screen.getByRole("menuitem", { name: "删除当前列" })).toBeTruthy()
    expect(screen.getByRole("menuitem", { name: "拆分当前单元格" })).toBeTruthy()
    expect(screen.getByRole("menuitem", { name: "删除整个表格" })).toBeTruthy()
    expect(
      screen.getByRole("menuitem", { name: "撤销 Ctrl+Z" })
    ).toBeTruthy()
    expect(
      screen.getByRole("menuitem", { name: "一级标题 Ctrl+Alt+1" })
    ).toBeTruthy()
    expect(screen.getByRole("menuitem", { name: "分割线" })).toBeTruthy()
  })
})
