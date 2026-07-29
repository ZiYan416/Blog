// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePostList } from '../src/features/posts/hooks/use-post-list'

const post = {
  id: 'post-1',
  title: '文章',
  slug: 'post-1',
  excerpt: null,
  cover_image: null,
  published: true,
  featured: false,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  tags: [],
  category: null,
  view_count: 0,
}

function renderPostListHook() {
  return renderHook(() =>
    usePostList({
      initialPosts: [post],
      initialTotal: 1,
      filters: { limit: 9 },
    }),
  )
}

describe('usePostList scroll restoration', () => {
  beforeEach(() => {
    sessionStorage.clear()
    window.history.replaceState({}, '', '/')
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('consumes saved detail-return state after restoring it once', async () => {
    sessionStorage.setItem(
      'post_list_return_state_v2',
      JSON.stringify({
        page: 1,
        sort: 'latest',
        scrollY: 420,
        pathname: '/post',
        returnKey: 'return-to-post-list',
      }),
    )
    window.history.replaceState(
      { __blogPostListReturnKey: 'return-to-post-list' },
      '',
      '/post',
    )

    const firstRender = renderPostListHook()

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 420,
        behavior: 'instant',
      })
    })
    expect(sessionStorage.getItem('post_list_return_state_v2')).toBeNull()
    expect(window.history.state.__blogPostListReturnKey).toBeUndefined()

    firstRender.unmount()
    vi.mocked(window.scrollTo).mockClear()
    renderPostListHook()

    await act(async () => {
      await Promise.resolve()
    })
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'instant',
    })
  })

  it('starts at the top instead of restoring stale state from another page', async () => {
    sessionStorage.setItem(
      'post_list_return_state_v2',
      JSON.stringify({
        page: 1,
        sort: 'latest',
        scrollY: 420,
        pathname: '/post',
        returnKey: 'stale-return-entry',
      }),
    )
    window.history.replaceState({}, '', '/post')

    renderPostListHook()

    await waitFor(() => {
      expect(sessionStorage.getItem('post_list_return_state_v2')).toBeNull()
    })
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'instant',
    })
  })

  it('does not save a return position for modified new-tab clicks', () => {
    renderPostListHook()
    const link = document.createElement('a')
    link.href = '/post/post-1'
    link.addEventListener('click', (event) => event.preventDefault())
    document.body.appendChild(link)

    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        button: 0,
        ctrlKey: true,
      }),
    )

    expect(sessionStorage.getItem('post_list_return_state_v2')).toBeNull()
    link.remove()
  })

  it('discards stale restoration data from the previous implementation', async () => {
    sessionStorage.setItem(
      'post_list_state',
      JSON.stringify({
        page: 1,
        sort: 'latest',
        scrollY: 420,
        pathname: '/post',
      }),
    )
    window.history.replaceState(null, '', '/post')

    renderPostListHook()

    await waitFor(() => {
      expect(sessionStorage.getItem('post_list_state')).toBeNull()
    })
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'instant',
    })
  })
})
