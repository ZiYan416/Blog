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
    await userEvent.click(screen.getByRole('button', { name: '确认删除' }))

    await waitFor(() => expect(onDeleted).toHaveBeenCalledOnce())
    expect(refresh).not.toHaveBeenCalled()
  })
})
