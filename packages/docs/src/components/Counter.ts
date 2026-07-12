import { h, state } from "organic-ui"

export function Counter({ label }: { label: string }) {
  const [count, setCount] = state(0)

  return h.div({
    class: "counter-container",
    children: [
      h.p({ text: () => `${label}: ${count()}` }),
      h.button({ text: "+", onClick: () => setCount(c => c + 1) }),
      h.button({ text: "-", onClick: () => setCount(c => c - 1) })
    ]
  })
}