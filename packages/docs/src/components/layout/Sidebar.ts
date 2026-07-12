import { h } from "organic-ui"

export interface SidebarSection {
  id: string
  label: string
}

export interface SidebarProps {
  sections: SidebarSection[]
  activeSection: () => string
  isOpen: () => boolean
  onSectionClick: (sectionId: string) => void
}

export function Sidebar({ sections, activeSection, isOpen, onSectionClick }: SidebarProps) {
  const baseClasses = "flex flex-col shrink-0 sticky overflow-y-auto p-4 border-r self-start bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
  const sizeClasses = "w-[240px] h-[calc(100dvh-56px)] top-14"
  const mobileClasses = "max-[768px]:fixed max-[768px]:z-1000 max-[768px]:top-0 max-[768px]:left-0 max-[768px]:h-screen max-[768px]:transition-transform"
  const mobileStateClasses = isOpen() 
    ? "max-[768px]:translate-x-0" 
    : "max-[768px]:-translate-x-full"
  
  return h.div({
    class: `${baseClasses} ${sizeClasses} ${mobileClasses} ${mobileStateClasses}`,
    children: [
      // Navigation items in scrollable container
      h.div({
        class: "flex-1 overflow-y-auto min-h-0",
        children: [
          ...sections.map(section =>
            h.a({
              href: `#${section.id}`,
              text: section.label,
              onClick: () => {
                onSectionClick(section.id)
              },
              class: () => {
                const isActive = activeSection() === section.id
                const baseClasses = "block w-full px-3 py-2 mb-0.5 no-underline rounded text-sm font-medium transition-all duration-150 cursor-pointer"
                const stateClasses = isActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                return `${baseClasses} ${stateClasses}`
              }
            })
          )
        ]
      }),
      // Links section at bottom
      h.div({
        class: "shrink-0 pt-3 border-t mt-3 border-slate-200 dark:border-slate-800",
        children: [
          h.div({
            text: "Links",
            class: "text-xs font-semibold uppercase tracking-wide mb-2 text-slate-500 dark:text-slate-400"
          }),
          h.a({
            href: "https://github.com/pavi2410/organic-ui",
            text: "GitHub",
            target: "_blank",
            rel: "noopener noreferrer",
            class: "block py-1.5 text-sm no-underline transition-colors duration-150 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          }),
          h.a({
            href: "https://www.npmjs.com/package/organic-ui",
            text: "npm",
            target: "_blank",
            rel: "noopener noreferrer",
            class: "block py-1.5 text-sm no-underline transition-colors duration-150 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          })
        ]
      })
    ]
  })
}
