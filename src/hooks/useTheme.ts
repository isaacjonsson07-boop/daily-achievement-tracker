import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme }
}