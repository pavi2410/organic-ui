import { state, effect, Show } from "organic-ui"
import { Introduction } from "./docs/Introduction.js"
import { GettingStarted } from "./docs/GettingStarted.js"
import { Reactivity } from "./docs/Reactivity.js"
import { Primitives } from "./docs/Primitives.js"
import { Components } from "./docs/Components.js"
import { Examples } from "./docs/Examples.js"
import { Benchmarks } from "./docs/Benchmarks.js"
import { PageLayout } from "./components/layout/index.js"
import { createThemeManager } from "./utils/themeManager.js"

type Section = "intro" | "getting-started" | "reactivity" | "primitives" | "components" | "examples" | "benchmarks"

function getSectionFromHash(): Section {
  const hash = window.location.hash.slice(1) // Remove the '#'
  // Extract section from hash (e.g., "reactivity/state" -> "reactivity")
  const section = hash.split('/')[0]
  const validSections: Section[] = ["intro", "getting-started", "reactivity", "primitives", "components", "examples", "benchmarks"]
  return validSections.includes(section as Section) ? (section as Section) : "intro"
}

function scrollToSubsection() {
  const hash = window.location.hash.slice(1)
  const parts = hash.split('/')
  if (parts.length > 1) {
    const subsectionId = parts[1]
    // Wait for the DOM to update before scrolling
    setTimeout(() => {
      const element = document.getElementById(subsectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
}

export function DocsApp() {
  const [activeSection, setActiveSection] = state<Section>(getSectionFromHash())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = state(false)
  const [isSearchOpen, setIsSearchOpen] = state(false)
  
  // Initialize theme manager
  const themeManager = createThemeManager()

  const sections: { id: Section; label: string; component: () => any }[] = [
    { id: "intro", label: "Introduction", component: Introduction },
    { id: "getting-started", label: "Getting Started", component: GettingStarted },
    { id: "reactivity", label: "Reactivity", component: Reactivity },
    { id: "primitives", label: "Rendering Primitives", component: Primitives },
    { id: "components", label: "Components", component: Components },
    { id: "examples", label: "Examples", component: Examples },
    { id: "benchmarks", label: "Benchmarks", component: Benchmarks }
  ]

  // Update URL when activeSection changes (only if not already set)
  effect(() => {
    const currentHash = window.location.hash.slice(1)
    const currentSection = currentHash.split('/')[0]
    if (currentSection !== activeSection()) {
      window.history.pushState(null, "", `#${activeSection()}`)
    }
  })

  // Listen to browser back/forward navigation
  window.addEventListener("hashchange", () => {
    setActiveSection(getSectionFromHash())
    scrollToSubsection()
  })

  // Scroll to subsection on initial load
  scrollToSubsection()

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId as Section)
    setIsMobileMenuOpen(false)
  }

  const handleTocItemClick = (sectionId: string, itemId: string) => {
    window.location.hash = `${sectionId}/${itemId}`
    scrollToSubsection()
  }

  // Handle keyboard shortcut for search (Cmd/Ctrl + K)
  effect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  })

  return PageLayout({
    sections: sections.map(s => ({ id: s.id, label: s.label })),
    activeSection,
    isMobileMenuOpen,
    isSearchOpen,
    theme: themeManager.theme,
    onMenuToggle: () => setIsMobileMenuOpen(!isMobileMenuOpen()),
    onSearchToggle: () => setIsSearchOpen(!isSearchOpen()),
    onSearchClose: () => setIsSearchOpen(false),
    onThemeToggle: themeManager.toggleTheme,
    onSectionClick: handleSectionClick,
    onTocItemClick: handleTocItemClick,
    children: sections.map(section =>
      Show({
        when: () => activeSection() === section.id,
        children: section.component()
      })
    )
  })
}
