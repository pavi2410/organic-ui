import { state } from "organic-ui"

export type Theme = "light" | "dark"

const THEME_STORAGE_KEY = "organic-ui-docs-theme"

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored === "light" || stored === "dark" ? stored : null
}

function getInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

export function createThemeManager() {
  const [theme, setTheme] = state<Theme>(getInitialTheme())

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme)
    }
  }

  // Initialize theme on document
  applyTheme(theme())

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = theme() === "light" ? "dark" : "light"
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }

  // Set specific theme
  const setSpecificTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }

  // Listen to system theme changes
  if (typeof window !== "undefined") {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      // Only auto-switch if user hasn't set a preference
      if (!getStoredTheme()) {
        const newTheme = e.matches ? "dark" : "light"
        setTheme(newTheme)
        applyTheme(newTheme)
      }
    })
  }

  return {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme
  }
}
