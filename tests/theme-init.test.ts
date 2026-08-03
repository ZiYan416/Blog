// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { THEME_INIT_SCRIPT } from '@/features/settings/theme-init'

describe('theme initialization', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('applies the saved dark theme before client hydration', () => {
    localStorage.setItem('theme', 'dark')
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))

    window.eval(THEME_INIT_SCRIPT)

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('uses the system preference when no explicit theme is saved', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))

    window.eval(THEME_INIT_SCRIPT)

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
