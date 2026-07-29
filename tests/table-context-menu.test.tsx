// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import type { Editor } from "@tiptap/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { TableContextMenu } from "../src/features/posts/editor/table-context-menu"

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
  } as unknown as Editor
}

describe("TableContextMenu", () => {
  it("runs the current-row deletion command and closes the menu", () => {
    const onCommand = vi.fn()
    const onClose = vi.fn()

    render(
      <TableContextMenu
        editor={createEditorMock(onCommand)}
        position={{ x: 20, y: 30 }}
        onClose={onClose}
      />
    )

    fireEvent.click(screen.getByRole("menuitem", { name: "删除当前行" }))

    expect(onCommand).toHaveBeenCalledWith("deleteRow")
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("includes row, column, cell and whole-table operations", () => {
    render(
      <TableContextMenu
        editor={createEditorMock(vi.fn())}
        position={{ x: 20, y: 30 }}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByRole("menuitem", { name: "在上方插入行" })).toBeTruthy()
    expect(screen.getByRole("menuitem", { name: "删除当前列" })).toBeTruthy()
    expect(screen.getByRole("menuitem", { name: "拆分当前单元格" })).toBeTruthy()
    expect(screen.getByRole("menuitem", { name: "删除整个表格" })).toBeTruthy()
  })
})
