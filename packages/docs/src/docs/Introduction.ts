import { h } from "organic-ui"

export function Introduction() {
  return h.div({
    children: [
      h.div({
        text: "Introduction",
        class: "docs-page-title"
      }),
      h.p({
        text: "organic-ui is a lightweight reactive UI framework with fine-grained reactivity and declarative components.",
        class: "docs-intro-text"
      }),
      h.div({
        id: "features",
        text: "Features",
        class: "docs-section-title"
      }),
      h.div({
        class: "docs-list",
        children: [
          h.p({
            text: "• Fine-grained reactivity - Efficient updates with reactive state",
            class: "docs-list-item"
          }),
          h.p({
            text: "• Declarative components - Compose UIs with simple functions",
            class: "docs-list-item"
          }),
          h.p({
            text: "• Zero dependencies - Pure TypeScript implementation",
            class: "docs-list-item"
          }),
          h.p({
            text: "• Tiny footprint - Minimal runtime overhead",
            class: "docs-list-item"
          })
        ]
      }),
      h.div({
        id: "philosophy",
        text: "Philosophy",
        class: "docs-section-title"
      }),
      h.p({
        text: "organic-ui provides reactive primitives (state, effect, For, Show) and common HTML elements. For specialized elements or complex UI patterns, create custom components or use a component library built on organic-ui. The framework focuses on being a solid foundation rather than a complete UI toolkit.",
        class: "docs-text"
      })
    ]
  })
}
