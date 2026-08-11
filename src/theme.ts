import { useEffect, useState } from "react"

export type ThemeMode = "dark" | "light"

const THEME_KEY = "gridlock-theme"

export function getStoredTheme(): ThemeMode {
  try {
    const t = localStorage.getItem(THEME_KEY)
    if (t === "light" || t === "dark") return t
  } catch {}
  return "dark"
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme)
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {}
}

export function useTheme(): [ThemeMode, () => void] {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const t = getStoredTheme()
    applyTheme(t)
    return t
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggle = () => setTheme(prev => (prev === "dark" ? "light" : "dark"))
  return [theme, toggle]
}
