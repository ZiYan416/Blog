"use client"

import { useEffect, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import type { Editor } from "@tiptap/react"
import { cn } from "@/lib/utils"

export interface TableContextMenuPosition {
  x: number
  y: number
}

interface TableContextMenuProps {
  editor: Editor
  position: TableContextMenuPosition
  onClose: () => void
}

interface TableMenuAction {
  label: string
  run: () => boolean
  enabled: boolean
  destructive?: boolean
}

const MENU_WIDTH = 224
const MENU_HEIGHT = 420
const VIEWPORT_GAP = 8

export function TableContextMenu({
  editor,
  position,
  onClose,
}: TableContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const coordinates = useMemo(
    () => ({
      left: Math.min(
        Math.max(VIEWPORT_GAP, position.x),
        Math.max(VIEWPORT_GAP, window.innerWidth - MENU_WIDTH - VIEWPORT_GAP)
      ),
      top: Math.min(
        Math.max(VIEWPORT_GAP, position.y),
        Math.max(VIEWPORT_GAP, window.innerHeight - MENU_HEIGHT - VIEWPORT_GAP)
      ),
    }),
    [position]
  )

  useEffect(() => {
    const closeForOutsidePointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        onClose()
      }
    }
    const closeForEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("pointerdown", closeForOutsidePointer)
    document.addEventListener("keydown", closeForEscape)
    window.addEventListener("blur", onClose)
    window.addEventListener("resize", onClose)
    window.addEventListener("scroll", onClose, true)

    return () => {
      document.removeEventListener("pointerdown", closeForOutsidePointer)
      document.removeEventListener("keydown", closeForEscape)
      window.removeEventListener("blur", onClose)
      window.removeEventListener("resize", onClose)
      window.removeEventListener("scroll", onClose, true)
    }
  }, [onClose])

  const groups: TableMenuAction[][] = [
    [
      {
        label: "在上方插入行",
        run: () => editor.chain().focus().addRowBefore().run(),
        enabled: editor.can().addRowBefore(),
      },
      {
        label: "在下方插入行",
        run: () => editor.chain().focus().addRowAfter().run(),
        enabled: editor.can().addRowAfter(),
      },
      {
        label: "删除当前行",
        run: () => editor.chain().focus().deleteRow().run(),
        enabled: editor.can().deleteRow(),
        destructive: true,
      },
    ],
    [
      {
        label: "在左侧插入列",
        run: () => editor.chain().focus().addColumnBefore().run(),
        enabled: editor.can().addColumnBefore(),
      },
      {
        label: "在右侧插入列",
        run: () => editor.chain().focus().addColumnAfter().run(),
        enabled: editor.can().addColumnAfter(),
      },
      {
        label: "删除当前列",
        run: () => editor.chain().focus().deleteColumn().run(),
        enabled: editor.can().deleteColumn(),
        destructive: true,
      },
    ],
    [
      {
        label: "切换表头行",
        run: () => editor.chain().focus().toggleHeaderRow().run(),
        enabled: editor.can().toggleHeaderRow(),
      },
      {
        label: "合并选中单元格",
        run: () => editor.chain().focus().mergeCells().run(),
        enabled: editor.can().mergeCells(),
      },
      {
        label: "拆分当前单元格",
        run: () => editor.chain().focus().splitCell().run(),
        enabled: editor.can().splitCell(),
      },
    ],
    [
      {
        label: "删除整个表格",
        run: () => editor.chain().focus().deleteTable().run(),
        enabled: editor.can().deleteTable(),
        destructive: true,
      },
    ],
  ]

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="表格编辑菜单"
      className="fixed z-[100] w-56 overflow-hidden rounded-xl border border-black/10 bg-white p-1.5 text-sm shadow-2xl dark:border-white/10 dark:bg-neutral-900"
      style={coordinates}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="px-2.5 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        表格操作
      </div>
      {groups.map((actions, groupIndex) => (
        <div
          key={actions[0].label}
          className={cn(
            groupIndex > 0 &&
              "mt-1 border-t border-black/[0.07] pt-1 dark:border-white/[0.08]"
          )}
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              disabled={!action.enabled}
              className={cn(
                "flex w-full items-center rounded-lg px-2.5 py-2 text-left transition-colors",
                action.destructive
                  ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/[0.07]",
                "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (action.enabled) action.run()
                onClose()
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      ))}
    </div>,
    document.body
  )
}
