'use client'
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const ThemeContext = createContext({ theme: 'dark', setTheme: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved)
        document.documentElement.classList.toggle('dark', saved === 'dark')
      } else {
        // Default to dark
        document.documentElement.classList.add('dark')
      }
    } catch {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme)
    try { localStorage.setItem('theme', newTheme) } catch {}
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
