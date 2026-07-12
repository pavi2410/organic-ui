import { h } from "organic-ui"
import { CopyButton } from "./CopyButton.js"
import { lexTypeScript } from "../utils/lexer.js"

interface CodeViewerProps {
  code: string
  language?: string
}

// Apply CSS Custom Highlight API
function applyHighlighting(element: HTMLElement, code: string): () => void {
  if (!CSS.highlights) {
    console.warn('CSS Custom Highlight API not supported')
    return () => {}
  }

  const textNode = element.firstChild
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    return () => {}
  }

  const tokens = lexTypeScript(code)
  
  // Create ranges for each token
  const tokenRanges = tokens.map(token => {
    const range = new Range()
    range.setStart(textNode, token.start)
    range.setEnd(textNode, token.end)
    return { type: token.type, range }
  })
  
  // Group ranges by token type
  const highlightsByType = Map.groupBy(tokenRanges, (item: { type: string; range: Range }) => item.type)

  // Create highlights and add to global registry
  const createdHighlights = new Map<string, Highlight>()
  
  for (const [type, items] of highlightsByType) {
    const ranges = items.map((item: { type: string; range: Range }) => item.range)
    const highlight = new Highlight(...ranges)
    createdHighlights.set(type, highlight)
    
    const existing = CSS.highlights.get(type)
    if (existing) {
      ranges.forEach(range => existing.add(range))
    } else {
      CSS.highlights.set(type, highlight)
    }
  }

  // Return cleanup function
  return () => {
    for (const [type, highlight] of createdHighlights) {
      const globalHighlight = CSS.highlights.get(type)
      if (globalHighlight) {
        highlight.forEach(range => globalHighlight.delete(range))
        if (globalHighlight.size === 0) {
          CSS.highlights.delete(type)
        }
      }
    }
  }
}

// Highlighted code component using ref pattern
function HighlightedCode(code: string, language: string) {
  return h.div({
    text: code,
    style: { color: "#2c3e50" },
    ref: (el: HTMLDivElement) => {
      // Apply highlighting after mount and return cleanup
      if (language === "typescript" || language === "javascript" || 
          language === "ts" || language === "js") {
        return applyHighlighting(el, code)
      }
    }
  })
}

export function CodeViewer({ code, language = "plaintext" }: CodeViewerProps) {
  return h.div({
    style: {
      position: "relative",
      background: "#f5f5f5",
      padding: "15px",
      borderRadius: "4px",
      fontFamily: "monospace",
      fontSize: "14px",
      overflowX: "auto",
      border: "1px solid #e0e0e0",
      whiteSpace: "pre",
      lineHeight: "1.5"
    },
    children: [
      HighlightedCode(code, language),
      CopyButton(code)
    ]
  })
}
