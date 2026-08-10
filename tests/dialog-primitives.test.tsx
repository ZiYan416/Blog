// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

afterEach(() => {
  cleanup()
})

function TestDialog({ showCloseButton }: { showCloseButton?: boolean }) {
  return (
    <Dialog defaultOpen>
      <DialogContent showCloseButton={showCloseButton}>
        <DialogTitle>编辑文章</DialogTitle>
        <DialogDescription>修改文章内容并保存。</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog primitives', () => {
  it('renders a labelled close button by default', () => {
    render(<TestDialog />)

    const dialog = screen.getByRole('dialog', { name: '编辑文章' })
    const closeButton = screen.getByRole('button', { name: '关闭' })

    expect(dialog).toBeTruthy()
    expect(closeButton.getAttribute('aria-label')).toBe('关闭')
    expect(closeButton.className).toContain('h-11')
    expect(closeButton.className).toContain('w-11')
    expect(closeButton.className).toContain('focus-visible:ring-2')
  })

  it('can hide the built-in close button for custom dialog chrome', () => {
    render(<TestDialog showCloseButton={false} />)

    expect(screen.getByRole('dialog', { name: '编辑文章' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: '关闭' })).toBeNull()
  })
})

describe('AlertDialog primitives', () => {
  it('keeps the alertdialog role and exposes title, description, and actions', () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除文章？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后将无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )

    const alertDialog = screen.getByRole('alertdialog', { name: '删除文章？' })

    expect(alertDialog).toBeTruthy()
    expect(alertDialog.textContent).toContain('删除后将无法恢复。')
    expect(screen.getByRole('button', { name: '取消' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '确认删除' })).toBeTruthy()
    expect(alertDialog.className).toContain('w-[calc(100%-2rem)]')
    expect(alertDialog.className).toContain('max-h-[85dvh]')
    expect(alertDialog.className).toContain('overflow-y-auto')
  })
})
