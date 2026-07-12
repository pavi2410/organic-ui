import { h } from "organic-ui"
import type { Theme } from "../utils/themeManager.js"

export interface ThemeToggleProps {
  theme: () => Theme
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return h.button({
    onClick: onToggle,
    class: "px-2.5 py-1.5 rounded transition-all duration-150 border text-base bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
    text: () => theme() === "dark" ? "☀️" : "🌙"
  })
}
