// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DeletePostButton } from '@/features/posts/components/delete-post-button'

const refresh = vi.fn()
const toast = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}))

describe('DeletePostButton', () => {
  beforeEach(() => {
    refresh.mockReset()
    toast.mockReset()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('removes the card locally instead of refreshing the list back to page one', async () => {
    const onDeleted = vi.fn()
    render(
      <DeletePostButton
        slug="post-1"
        title="文章"
        onDeleted={onDeleted}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: '删除文章：文章' }))
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: '确认删除' }))

    await waitFor(() => expect(onDeleted).toHaveBeenCalledOnce())
    expect(refresh).not.toHaveBeenCalled()
  })

  it('locks the alert dialog while deletion is pending', async () => {
    let resolveFetch!: (value: {
      ok: boolean
      json: () => Promise<{ success: boolean }>
    }) => void
    const pendingFetch = new Promise<{ ok: boolean; json: () => Promise<{ success: boolean }> }>((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pendingFetch))

    render(
      <DeletePostButton
        slug="post-1"
        title="文章"
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: '删除文章：文章' }))
    const alertDialog = screen.getByRole('alertdialog')
    const cancelButton = screen.getByRole('button', { name: '取消' })
    const confirmButton = screen.getByRole('button', { name: '确认删除' })

    await userEvent.click(confirmButton)

    expect(screen.getByRole('alertdialog')).toBe(alertDialog)
    expect((cancelButton as HTMLButtonElement).disabled).toBe(true)
    expect((confirmButton as HTMLButtonElement).disabled).toBe(true)

    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('alertdialog')).toBe(alertDialog)

    resolveFetch({ ok: true, json: async () => ({ success: true }) })
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  })

  it('keeps the alert dialog open when deletion fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: '删除失败' }),
    }))

    render(
      <DeletePostButton
        slug="post-1"
        title="文章"
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: '删除文章：文章' }))
    await userEvent.click(screen.getByRole('button', { name: '确认删除' }))

    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      variant: 'destructive',
      title: '删除失败',
    })))
    expect(screen.getByRole('alertdialog')).toBeTruthy()
  })
})
