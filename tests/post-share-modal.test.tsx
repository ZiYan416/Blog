// @vitest-environment jsdom

import React from 'react'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PostShareModal } from '@/features/posts/components/post-share-modal'

const { renderShareCardPng, toast } = vi.hoisted(() => ({
  renderShareCardPng: vi.fn(),
  toast: vi.fn(),
}))

vi.mock('@/features/posts/share-card-image', () => ({ renderShareCardPng }))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}))

const post = {
  title: '一篇用于分享的文章',
  slug: 'share-post',
  public_id: 42,
  excerpt: '文章摘要',
  cover_image: null,
  created_at: '2026-08-10T00:00:00.000Z',
  tags: ['测试'],
  author: null,
  url: 'https://example.com/post/42',
}

describe('PostShareModal', () => {
  beforeEach(() => {
    renderShareCardPng.mockReset()
    toast.mockReset()
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('shows a retry state instead of leaving the loading indicator spinning', async () => {
    renderShareCardPng
      .mockRejectedValueOnce(new Error('remote cover blocked'))
      .mockResolvedValueOnce('data:image/png;base64,recovered')

    render(
      <PostShareModal open onOpenChange={() => undefined} post={post} />,
    )

    expect(await screen.findByText('卡片没有生成成功')).toBeTruthy()
    expect(screen.queryByText('正在生成高清卡片')).toBeNull()
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: '生成分享卡片失败',
      variant: 'destructive',
    }))

    await userEvent.click(screen.getByRole('button', { name: '重新生成' }))

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /分享卡片预览/ })).toBeTruthy()
    })
    expect(screen.getByText('图片已就绪')).toBeTruthy()
    expect(renderShareCardPng).toHaveBeenCalledTimes(2)
  })
})
