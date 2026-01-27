'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'relative w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all',
        theme === 'dark' && 'bg-slate-800 text-yellow-400'
      )}
      aria-label="切换主题"
    >
      <Sun className={cn(
        'h-5 w-5 absolute transition-all duration-300',
        theme === 'dark' ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
      )}
      />
      <Moon className={cn(
        'h-5 w-5 absolute transition-all duration-300',
        theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
      )}
      />
    </Button>
  )
}
