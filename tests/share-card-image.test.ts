// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { toPng } = vi.hoisted(() => ({
  toPng: vi.fn(),
}))

vi.mock('html-to-image', () => ({ toPng }))

import {
  renderShareCardPng,
  SHARE_CARD_IMAGE_PLACEHOLDER,
} from '@/features/posts/share-card-image'

describe('share card image export', () => {
  beforeEach(() => {
    toPng.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps signed URLs unchanged and replaces unavailable optional images', async () => {
    const card = document.createElement('div')
    toPng.mockResolvedValue('data:image/png;base64,card')

    await expect(renderShareCardPng(card)).resolves.toBe(
      'data:image/png;base64,card',
    )

    expect(toPng).toHaveBeenCalledWith(
      card,
      expect.objectContaining({
        cacheBust: false,
        includeQueryParams: true,
        imagePlaceholder: SHARE_CARD_IMAGE_PLACEHOLDER,
        pixelRatio: 2,
        skipFonts: false,
      }),
    )
  })

  it('retries with system fonts when font embedding breaks the export', async () => {
    const card = document.createElement('div')
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    toPng
      .mockRejectedValueOnce(new Error('font request failed'))
      .mockResolvedValueOnce('data:image/png;base64,fallback')

    await expect(renderShareCardPng(card)).resolves.toBe(
      'data:image/png;base64,fallback',
    )

    expect(toPng).toHaveBeenCalledTimes(2)
    expect(toPng.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        cacheBust: false,
        imagePlaceholder: SHARE_CARD_IMAGE_PLACEHOLDER,
        skipFonts: true,
      }),
    )
    expect(warning).toHaveBeenCalledOnce()
  })
})
