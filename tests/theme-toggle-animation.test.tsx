// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeToggle } from '@/components/layout/theme-toggle'
import {
  buildThemeRevealCss,
  getThemeRevealGeometry,
  THEME_REVEAL_DURATION,
  THEME_REVEAL_EASING,
} from '@/features/settings/theme-transition'
import { THEME_STORAGE_KEY } from '@/features/settings/theme-init'

describe('native circle-blur theme reveal', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
    Reflect.deleteProperty(document, 'startViewTransition')
  })

  afterEach(() => {
    cleanup()
    Reflect.deleteProperty(document, 'startViewTransition')
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('builds a blurred mask from the button that reaches all viewport corners', () => {
    const trigger = document.createElement('button')
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      left: 20, top: 30, width: 40, height: 40,
    } as DOMRect)

    const geometry = getThemeRevealGeometry(trigger, document)
    expect(geometry.x).toBe(40)
    expect(geometry.y).toBe(50)
    expect(geometry.feather).toBeGreaterThan(0)
    expect(geometry.farthestCorner).toBeGreaterThan(0)

    const css = buildThemeRevealCss(geometry, true)
    expect(css).toContain('radial-gradient(circle at 40px 50px')
    expect(css).toContain('@property --blog-native-circle-radius')
    expect(css).toContain('mask-image:')
    expect(css).toContain('750ms ease-in-out')
    expect(THEME_REVEAL_DURATION).toBe(750)
    expect(THEME_REVEAL_EASING).toBe('ease-in-out')
  })

  it('expands on dark and contracts on light', () => {
    const geometry = { x: 10, y: 20, farthestCorner: 500, feather: 40 }
    const toDark = buildThemeRevealCss(geometry, true)
    const toLight = buildThemeRevealCss(geometry, false)

    expect(toDark).toContain('from { --blog-native-circle-radius: -40px; }')
    expect(toDark).toContain('to { --blog-native-circle-radius: 540px; }')
    expect(toLight).toContain('from { --blog-native-circle-radius: 540px; }')
    expect(toLight).toContain('to { --blog-native-circle-radius: -40px; }')
    expect(toDark).toContain('#000 calc(')
    expect(toLight).toContain('transparent calc(')
  })

  it('preserves original theme writes in browsers without View Transitions', async () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: '切换主题' })

    fireEvent.click(button)
    await waitFor(() => {
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.style.colorScheme).toBe('dark')
    })

    fireEvent.click(button)
    await waitFor(() => {
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(document.documentElement.style.colorScheme).toBe('light')
    })
  })

  it('uses native startViewTransition and cleans up temporary styles', async () => {
    const start = vi.fn((update: () => void) => {
      update()
      return {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: vi.fn(),
      }
    })
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: start })

    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: '切换主题' }))

    expect(start).toHaveBeenCalledOnce()
    expect(document.querySelector('style#blog-native-circle-blur')).not.toBeNull()
    await waitFor(() => {
      expect(document.querySelector('style#blog-native-circle-blur')).toBeNull()
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    })
  })

  it('switches immediately when reduced motion is enabled', () => {
    const start = vi.fn()
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: start })
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('reduced-motion') })))
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: '切换主题' }))

    expect(start).not.toHaveBeenCalled()
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('keeps rapid successive clicks consistent without stale style cleanup', async () => {
    const finishers: Array<() => void> = []
    const skips: Array<ReturnType<typeof vi.fn>> = []
    const start = vi.fn((update: () => void) => {
      update()
      const skipTransition = vi.fn()
      skips.push(skipTransition)
      return {
        finished: new Promise<void>((resolve) => finishers.push(resolve)),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition,
      }
    })
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: start })

    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: '切换主题' })
    fireEvent.click(button)
    fireEvent.click(button)

    expect(skips[0]).toHaveBeenCalledOnce()
    expect(start).toHaveBeenCalledTimes(2)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    finishers[0]()
    await Promise.resolve()
    expect(document.querySelector('style#blog-native-circle-blur')).not.toBeNull()
    finishers[1]()
    await waitFor(() => {
      expect(document.querySelector('style#blog-native-circle-blur')).toBeNull()
    })
  })
})
