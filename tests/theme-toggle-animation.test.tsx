// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeToggle } from '@/components/layout/theme-toggle'
import { THEME_STORAGE_KEY } from '@/features/settings/theme-init'

const animationHook = vi.hoisted(() => vi.fn())

vi.mock('theme-switch-animation/react', () => ({
  ThemeAnimationType: { CIRCLE_BLUR: 'circle-blur' },
  useThemeAnimation: animationHook,
}))

describe('ThemeToggle animation integration', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
    animationHook.mockImplementation((
      options: { isDark: boolean; onChange: (nextIsDark: boolean) => void },
    ) => ({
      ref: { current: null },
      toggleTheme: () => options.onChange(!options.isDark),
    }))
  })

  afterEach(() => {
    cleanup()
    animationHook.mockReset()
    vi.unstubAllGlobals()
  })

  it('uses the requested controlled CIRCLE_BLUR animation options', () => {
    render(<ThemeToggle />)

    expect(animationHook).toHaveBeenCalledWith(expect.objectContaining({
      isDark: false,
      onChange: expect.any(Function),
      animationType: 'circle-blur',
      duration: 750,
      easing: 'ease-in-out',
      reverse: 'auto',
    }))
  })

  it('keeps the original dark and light theme persistence and color scheme changes', async () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: '切换主题' })

    fireEvent.click(button)
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.style.colorScheme).toBe('dark')
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    })

    fireEvent.click(button)
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(document.documentElement.style.colorScheme).toBe('light')
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    })
  })
})
