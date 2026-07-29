"use client"

import { useEffect, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import type { Editor } from "@tiptap/react"
import { cn } from "@/lib/utils"

export interface EditorContextMenuPosition {
  x: number
  y: number
}

export interface EditorMenuAction {
  label: string
  run: () => void | boolean | Promise<void>
  enabled?: boolean
  shortcut?: string
  destructive?: boolean
}

export interface EditorMenuGroup {
  label?: string
  actions: EditorMenuAction[]
}

interface ContextMenuSurfaceProps {
  ariaLabel: string
  groups: EditorMenuGroup[]
  position: EditorContextMenuPosition
  onClose: () => void
}

interface EditorContextMenuProps {
  editor: Editor
  position: EditorContextMenuPosition
  onClose: () => void
  onClipboardError: (message: string) => void
}

const MENU_WIDTH = 256
const MENU_HEIGHT = 620
const VIEWPORT_GAP = 8

function ContextMenuSurface({
  ariaLabel,
  groups,
  position,
  onClose,
}: ContextMenuSurfaceProps) {
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

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label={ariaLabel}
      className="fixed z-[100] w-64 max-h-[min(620px,calc(100vh-16px))] overflow-y-auto rounded-xl border border-black/10 bg-white p-1.5 text-sm shadow-2xl dark:border-white/10 dark:bg-neutral-900"
      style={coordinates}
      onContextMenu={(event) => event.preventDefault()}
    >
      {groups.map((group, groupIndex) => (
        <div
          key={`${group.label || "group"}-${group.actions[0]?.label}`}
          className={cn(
            groupIndex > 0 &&
              "mt-1 border-t border-black/[0.07] pt-1 dark:border-white/[0.08]"
          )}
        >
          {group.label ? (
            <div className="px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {group.label}
            </div>
          ) : null}
          {group.actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              disabled={action.enabled === false}
              className={cn(
                "flex w-full items-center justify-between gap-4 rounded-lg px-2.5 py-2 text-left transition-colors",
                action.destructive
                  ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/[0.07]",
                "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={async () => {
                if (action.enabled !== false) await action.run()
                onClose()
              }}
            >
              <span>{action.label}</span>
              {action.shortcut ? (
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {action.shortcut}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ))}
    </div>,
    document.body
  )
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function plainTextToHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .map(
      (paragraph) =>
        `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>") || "<br>"}</p>`
    )
    .join("")
}

export function EditorContextMenu({
  editor,
  position,
  onClose,
  onClipboardError,
}: EditorContextMenuProps) {
  const hasSelection = !editor.state.selection.empty
  const inTable = editor.isActive("table")

  const copySelection = async () => {
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, "\n")
    await navigator.clipboard.writeText(text)
  }

  const groups: EditorMenuGroup[] = [
    {
      actions: [
        {
          label: "撤销",
          shortcut: "Ctrl+Z",
          run: () => editor.chain().focus().undo().run(),
          enabled: editor.can().undo(),
        },
        {
          label: "重做",
          shortcut: "Ctrl+Y",
          run: () => editor.chain().focus().redo().run(),
          enabled: editor.can().redo(),
        },
      ],
    },
    {
      actions: [
        {
          label: "剪切",
          shortcut: "Ctrl+X",
          enabled: hasSelection,
          run: async () => {
            try {
              await copySelection()
              editor.chain().focus().deleteSelection().run()
            } catch {
              onClipboardError("无法访问剪贴板，请检查浏览器权限")
            }
          },
        },
        {
          label: "复制",
          shortcut: "Ctrl+C",
          enabled: hasSelection,
          run: async () => {
            try {
              await copySelection()
            } catch {
              onClipboardError("无法访问剪贴板，请检查浏览器权限")
            }
          },
        },
        {
          label: "粘贴",
          shortcut: "Ctrl+V",
          run: async () => {
            try {
              const text = await navigator.clipboard.readText()
              if (text) {
                editor.chain().focus().insertContent(plainTextToHtml(text)).run()
              }
            } catch {
              onClipboardError("浏览器未允许读取剪贴板，请使用 Ctrl+V")
            }
          },
        },
        {
          label: "全选",
          shortcut: "Ctrl+A",
          run: () => editor.chain().focus().selectAll().run(),
        },
      ],
    },
    {
      label: "段落与格式",
      actions: [
        {
          label: "正文",
          run: () => editor.chain().focus().setParagraph().run(),
          enabled: editor.can().setParagraph(),
        },
        {
          label: "一级标题",
          shortcut: "Ctrl+Alt+1",
          run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          label: "二级标题",
          shortcut: "Ctrl+Alt+2",
          run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          label: "三级标题",
          shortcut: "Ctrl+Alt+3",
          run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
          label: "加粗",
          shortcut: "Ctrl+B",
          run: () => editor.chain().focus().toggleBold().run(),
        },
        {
          label: "斜体",
          shortcut: "Ctrl+I",
          run: () => editor.chain().focus().toggleItalic().run(),
        },
        {
          label: "行内代码",
          shortcut: "Ctrl+E",
          run: () => editor.chain().focus().toggleCode().run(),
        },
        {
          label: "无序列表",
          run: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
          label: "有序列表",
          run: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
          label: "引用",
          run: () => editor.chain().focus().toggleBlockquote().run(),
        },
      ],
    },
    {
      label: "插入",
      actions: [
        {
          label: "表格",
          run: () =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run(),
        },
        {
          label: "分割线",
          run: () => editor.chain().focus().setHorizontalRule().run(),
        },
      ],
    },
  ]

  if (inTable) {
    groups.push(
      {
        label: "表格行列",
        actions: [
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
      },
      {
        label: "表格单元格",
        actions: [
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
          {
            label: "删除整个表格",
            run: () => editor.chain().focus().deleteTable().run(),
            enabled: editor.can().deleteTable(),
            destructive: true,
          },
        ],
      }
    )
  }

  return (
    <ContextMenuSurface
      ariaLabel="Markdown 编辑菜单"
      groups={groups}
      position={position}
      onClose={onClose}
    />
  )
}

export function SourceEditorContextMenu({
  groups,
  position,
  onClose,
}: {
  groups: EditorMenuGroup[]
  position: EditorContextMenuPosition
  onClose: () => void
}) {
  return (
    <ContextMenuSurface
      ariaLabel="Markdown 源码编辑菜单"
      groups={groups}
      position={position}
      onClose={onClose}
    />
  )
}
