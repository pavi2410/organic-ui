import { h, state, effect, memo, For, Show } from "organic-ui"
import { buildSearchIndex, search } from "../utils/searchIndex.js"
import type { SearchResult } from "../utils/searchIndex.js"

export interface SearchProps {
  isOpen: () => boolean
  onClose: () => void
}

function SearchResultItem({ result, onSelect }: { result: SearchResult; onSelect: () => void }) {
  const href = result.subsectionId 
    ? `#${result.sectionId}/${result.subsectionId}`
    : `#${result.sectionId}`
  
  const subsectionText = result.subsection ? ` › ${result.subsection}` : ""
  
  return h.a({
    href,
    class: "block p-4 no-underline border-b transition-colors duration-200 cursor-pointer border-gray-200 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800",
    onClick: (e: Event) => {
      e.preventDefault()
      window.location.hash = href.slice(1)
      onSelect()
    },
    children: [
      h.div({
        class: "flex items-center gap-2 mb-2",
        children: [
          h.div({
            text: result.section,
            class: "font-semibold text-gray-900 dark:text-slate-100"
          }),
          ...(subsectionText ? [h.div({
            text: subsectionText,
            class: "text-sm text-gray-600 dark:text-slate-400"
          })] : [])
        ]
      }),
      h.div({
        text: result.content.slice(0, 100) + (result.content.length > 100 ? "..." : ""),
        class: "text-sm line-clamp-2 text-gray-700 dark:text-slate-300"
      })
    ]
  })
}

export function Search({ isOpen, onClose }: SearchProps) {
  const [query, setQuery] = state("")
  const [searchIndex, setSearchIndex] = state<ReturnType<typeof buildSearchIndex>>([])
  
  // Build search index when component mounts
  effect(() => {
    if (isOpen()) {
      // Build index from current DOM
      setTimeout(() => {
        const index = buildSearchIndex()
        setSearchIndex(index)
      }, 100)
    }
  })
  
  // Perform search when query changes
  const results = memo(() => {
    const q = query()
    if (q.trim()) {
      const searchResults = search(q, searchIndex())
      return searchResults
    } else {
      return []
    }
  })
  
  // Handle keyboard shortcuts
  effect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (!isOpen()) {
          // Open search (handled by parent)
        }
      }
      
      // Escape to close
      if (e.key === "Escape" && isOpen()) {
        onClose()
        setQuery("")
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  })
  
  return Show({
    when: isOpen,
    children: h.div({
      class: "fixed inset-0 z-[1002] flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm animate-[fadeIn_200ms]",
      onClick: () => {
        onClose()
        setQuery("")
      },
      children: [
        h.div({
          class: "rounded-2xl w-[90%] max-w-[640px] max-h-[70vh] flex flex-col overflow-hidden animate-[slideDown_200ms] bg-white shadow-[0_0_0_1px_rgb(229,231,235),0_20px_25px_-5px_rgba(0,0,0,0.1)] dark:bg-slate-900 dark:shadow-[0_0_0_1px_rgb(51,65,85),0_20px_25px_-5px_rgba(0,0,0,0.5)]",
          onClick: ((e: Event) => {
            e.stopPropagation()
          }) as any,
          children: [
            h.div({
              class: "flex items-center gap-3 p-4 border-b border-gray-200 dark:border-slate-800",
              children: [
                h.div({
                  text: "🔍",
                  class: "text-lg text-gray-500 dark:text-slate-400"
                }),
                h.input({
                  type: "text",
                  placeholder: "Search documentation... (Cmd/Ctrl + K)",
                  class: "flex-1 bg-transparent border-none outline-none text-base text-gray-900 placeholder:text-gray-500 dark:text-slate-50 dark:placeholder:text-slate-400",
                  value: query,
                  onInput: (value: string) => setQuery(value)
                }),
                h.button({
                  text: "✕",
                  class: "px-3 py-1 rounded transition-colors duration-200 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800",
                  onClick: () => {
                    onClose()
                    setQuery("")
                  }
                })
              ]
            }),
            h.div({
              class: "flex-1 overflow-y-auto",
              children: [
                Show({
                  when: () => Boolean(query().trim() && results().length === 0),
                  children: h.div({
                    text: "No results found",
                    class: "p-8 text-center text-gray-500 dark:text-slate-400"
                  })
                }),
                For({
                  each: results,
                  children: (result) => SearchResultItem({
                    result,
                    onSelect: () => {
                      onClose()
                      setQuery("")
                    }
                  })
                })
              ]
            })
          ]
        })
      ]
    })
  })
}
