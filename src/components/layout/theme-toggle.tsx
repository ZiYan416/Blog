'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { THEME_STORAGE_KEY } from '@/features/settings/theme-init'

export function ThemeToggle({ className }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => false)

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
    document.documentElement.style.colorScheme = initialTheme
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    document.documentElement.style.colorScheme = newTheme
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'relative w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all',
        isDark && 'bg-slate-800 text-yellow-400',
        className
      )}
      aria-label="切换主题"
    >
      <Sun className={cn(
        'h-5 w-5 absolute transition-all duration-300',
        isDark ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
      )}
      />
      <Moon className={cn(
        'h-5 w-5 absolute transition-all duration-300',
        isDark ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
      )}
      />
    </Button>
  )
}

function subscribeToTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains('dark')
}
