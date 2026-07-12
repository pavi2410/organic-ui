import { h, Show } from "organic-ui"
import { Header } from "./Header.js"
import { Sidebar } from "./Sidebar.js"
import type { SidebarSection } from "./Sidebar.js"
import { TableOfContents } from "./TableOfContents.js"
import { Search } from "../Search.js"
import type { Theme } from "../../utils/themeManager.js"

export interface PageLayoutProps {
  sections: SidebarSection[]
  activeSection: () => string
  isMobileMenuOpen: () => boolean
  isSearchOpen: () => boolean
  theme: () => Theme
  onMenuToggle: () => void
  onSearchToggle: () => void
  onSearchClose: () => void
  onThemeToggle: () => void
  onSectionClick: (sectionId: string) => void
  onTocItemClick: (sectionId: string, itemId: string) => void
  children: any
}

export function PageLayout({
  sections,
  activeSection,
  isMobileMenuOpen,
  isSearchOpen,
  theme,
  onMenuToggle,
  onSearchToggle,
  onSearchClose,
  onThemeToggle,
  onSectionClick,
  onTocItemClick,
  children
}: PageLayoutProps) {
  return h.div({
    class: "flex flex-col min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50",
    children: [
      // Header with search and theme toggle
      Header({
        onMenuClick: onMenuToggle,
        onSearchClick: onSearchToggle,
        theme,
        onThemeToggle
      }),
      
      // Search modal
      Search({
        isOpen: isSearchOpen,
        onClose: onSearchClose
      }),
      
      // Body container with sidebar and main content
      h.div({
        class: "flex flex-1 mt-14",
        children: [
          // Sidebar
          Sidebar({
            sections,
            activeSection,
            isOpen: isMobileMenuOpen,
            onSectionClick: (sectionId) => {
              onSectionClick(sectionId)
            }
          }),
          
          // Overlay for mobile menu
          Show({
            when: isMobileMenuOpen,
            children: h.div({
              onClick: onMenuToggle,
              class: "fixed inset-0 z-999 bg-black/30 backdrop-blur-sm"
            })
          }),
          
          // Main content area with TOC
          h.div({
            class: "flex-1 flex gap-6 px-4 md:px-6 py-6 mx-auto w-full max-w-[1280px]",
            children: [
              // Content
              h.div({
                class: "content flex-1 max-w-[720px] leading-relaxed",
                children
              }),
              
              // Table of Contents (right sidebar) - auto-generated from page content
              TableOfContents({
                activeSection,
                onItemClick: onTocItemClick
              })
            ]
          })
        ]
      })
    ]
  })
}
