import { h, state, Show } from "organic-ui"

export function Accordion({ title, content }: { title: string; content: () => string }) {
  const [open, setOpen] = state(false)

  return h.div({
    class: "accordion",
    children: [
      h.div({
        text: title,
        class: "accordion-header",
        onClick: () => setOpen(isOpen => !isOpen)
      }),
      Show({
        when: open,
        children: h.p({
          text: content,
          class: "accordion-content"
        })
      })
    ]
  })
}