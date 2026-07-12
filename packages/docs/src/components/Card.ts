import { h } from "organic-ui"
import type { Renderable } from "organic-ui"

export function Card({ title, child }: { title: string; child: Renderable }) {
  return h.div({
    style: {
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "12px",
      margin: "8px 0",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
    },
    children: [
      h.p({ text: () => title }),
      child
    ]
  })
}