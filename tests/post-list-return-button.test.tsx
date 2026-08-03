// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PostListReturnButton } from '@/features/posts/components/post-list-return-button'
import {
  POST_DETAIL_HISTORY_ENTRY_KEY,
  POST_LIST_RETURN_STATE_KEY,
} from '@/features/posts/post-list-return-state'

const back = vi.fn()
const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back, push }),
}))

describe('PostListReturnButton', () => {
  beforeEach(() => {
    back.mockReset()
    push.mockReset()
    sessionStorage.clear()
    window.history.replaceState({}, '', '/post/post-1')
  })

  afterEach(cleanup)

  it('returns to the exact list history entry that opened the article', async () => {
    sessionStorage.setItem(
      POST_LIST_RETURN_STATE_KEY,
      JSON.stringify({
        page: 3,
        sort: 'latest',
        scrollY: 520,
        pathname: '/post',
        detailPathname: '/post/post-1',
        returnKey: 'list-entry',
      }),
    )
    render(<PostListReturnButton />)

    await userEvent.click(screen.getByRole('button', { name: '返回列表' }))

    expect(back).toHaveBeenCalledOnce()
    expect(push).not.toHaveBeenCalled()
    expect(window.history.state[POST_DETAIL_HISTORY_ENTRY_KEY]).toBeTruthy()
  })

  it('opens the list normally when the article was not reached from it', async () => {
    render(<PostListReturnButton />)

    await userEvent.click(screen.getByRole('button', { name: '返回列表' }))

    expect(push).toHaveBeenCalledWith('/post')
    expect(back).not.toHaveBeenCalled()
  })
})
