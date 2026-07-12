import { h, state, effect, For, Show } from "organic-ui"
import { extractTocFromPage } from "../../utils/tocGenerator.js"

export interface TocItem {
  text: string
  id: string
}

export interface TocSection {
  sectionId: string
  items: TocItem[]
}

export interface TableOfContentsProps {
  activeSection: () => string
  onItemClick: (sectionId: string, itemId: string) => void
}

function createTocItem(text: string, id: string, section: string, onClick: (sectionId: string, itemId: string) => void) {
  return h.a({ 
    href: `#${section}/${id}`,
    text,
    class: "block mb-1.5 no-underline cursor-pointer transition-all duration-150 px-2 py-1 rounded text-xs leading-relaxed text-slate-600 hover:text-blue-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-900",
    onClick: (e) => {
      e.preventDefault()
      onClick(section, id)
    }
  })
}

export function TableOfContents({ activeSection, onItemClick }: TableOfContentsProps) {
  const [tocItems, setTocItems] = state<TocItem[]>([])

  // Extract TOC items whenever the active section changes
  effect(() => {
    const section = activeSection()
    // Wait for DOM to update after section change
    setTimeout(() => {
      const items = extractTocFromPage()
      setTocItems(items)
    }, 50)
    
    // Use section to ensure effect tracks activeSection changes
    void section
  })

  return Show({
    when: () => tocItems().length > 0,
    children: h.div({
      class: "shrink-0 sticky overflow-y-auto text-sm w-[200px] self-start h-fit top-[calc(56px+1.5rem)] max-h-[calc(100dvh-56px-2rem)] max-[1024px]:hidden max-[768px]:static max-[768px]:-order-1 max-[768px]:mb-4 max-[768px]:pb-3 max-[768px]:border-b max-[768px]:max-h-none max-[768px]:border-slate-200 dark:max-[768px]:border-slate-800",
      children: [
        h.div({
          text: "On this page",
          class: "font-semibold mb-3 text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300"
        }),
        h.div({
          class: "space-y-0.5",
          children: [
            For({
              each: tocItems,
              children: (item) => createTocItem(item.text, item.id, activeSection(), onItemClick)
            })
          ]
        })
      ]
    })
  })
}
