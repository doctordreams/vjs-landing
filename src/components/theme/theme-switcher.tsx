'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Palette, Sun, Moon, Monitor } from 'lucide-react'

type Theme = 'light' | 'dark' | 'bold-tech'

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') as Theme || 'light'
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    
    // Remove all theme classes and attributes
    root.classList.remove('light', 'dark')
    root.removeAttribute('data-theme')
    
    // Apply new theme
    if (newTheme === 'bold-tech') {
      root.setAttribute('data-theme', 'bold-tech')
    } else {
      root.classList.add(newTheme)
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme)
  }

  const handleThemeChange = () => {
    // Cycle through themes: light -> dark -> bold-tech -> light
    const themes: Theme[] = ['light', 'dark', 'bold-tech']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    const nextTheme = themes[nextIndex]
    
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />
      case 'dark':
        return <Moon className="w-4 h-4" />
      case 'bold-tech':
        return <Palette className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'bold-tech':
        return 'Bold Tech'
      default:
        return 'Theme'
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleThemeChange}
      className="flex items-center gap-2 hover:bg-accent transition-colors"
    >
      {getThemeIcon()}
      <span className="text-sm font-medium">{getThemeLabel()}</span>
    </Button>
  )
}