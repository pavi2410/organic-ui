import { h, state, For } from "organic-ui"

interface TodoItem {
  id: number
  text: string
}

export function TodoList() {
  const [items, setItems] = state<TodoItem[]>([
    { id: 0, text: "Learn organic-ui" },
    { id: 1, text: "Build something cool" },
    { id: 2, text: "Ship it!" }
  ])
  const [nextId, setNextId] = state(3)

  const addItem = () => {
    const id = nextId()
    setItems([...items(), { id, text: `New task ${id}` }])
    setNextId(id => id + 1)
  }

  const removeItem = (id: number) => {
    setItems(items().filter(item => item.id !== id))
  }

  return h.div({
    style: {
      padding: "16px",
      fontFamily: "sans-serif"
    },
    children: [
      h.div({
        text: "Todo List",
        style: {
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "12px"
        }
      }),
      h.div({
        style: {
          marginBottom: "12px"
        },
        children: [
          For({
            each: items,
            key: (item, _index) => item.id,
            children: (item) => h.div({
              style: {
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px",
                background: "#f5f5f5",
                margin: "4px 0",
                borderRadius: "4px"
              },
              children: [
                h.div({
                  text: item.text,
                  style: { flex: "1" }
                }),
                h.button({
                  text: "Remove",
                  onClick: () => removeItem(item.id)
                })
              ]
            }),
            fallback: h.p({
              text: "No tasks yet. Add one to get started!",
              style: {
                color: "#999",
                fontStyle: "italic"
              }
            })
          })
        ]
      }),
      h.button({
        text: "Add Task",
        onClick: addItem
      })
    ]
  })
}
