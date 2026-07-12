import { h, state, html } from "organic-ui"

export function HtmlDemo() {
  const [name, setName] = state("Alice")
  const [count, setCount] = state(0)
  
  const names = ["Alice", "Bob", "Charlie", "Diana"]
  let currentIndex = 0

  return h.div({
    style: {
      padding: "20px",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      background: "#f9f9f9"
    },
    children: [
      html`
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Dynamic HTML Demo</h3>
          <p style="margin: 0; color: #666;">
            This content is rendered using the <code>html</code> tagged template.
          </p>
        </div>
      `,
      
      html`
        <div style="
          padding: 15px;
          background: white;
          border-radius: 6px;
          margin-bottom: 15px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        ">
          <p style="margin: 0 0 10px 0;">
            👋 Hello, <strong style="color: #007bff;">${name}</strong>!
          </p>
          <p style="margin: 0;">
            You've clicked the button <strong style="color: #28a745;">${count}</strong> time(s).
          </p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
            Double count: <strong>${() => count() * 2}</strong>
          </p>
        </div>
      `,
      
      h.div({
        style: {
          display: "flex",
          gap: "10px"
        },
        children: [
          h.button({
            text: "Change Name",
            onClick: () => {
              currentIndex = (currentIndex + 1) % names.length
              setName(names[currentIndex])
            },
            style: {
              padding: "8px 16px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }
          }),
          h.button({
            text: "Increment",
            onClick: () => setCount(c => c + 1),
            style: {
              padding: "8px 16px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }
          }),
          h.button({
            text: "Reset",
            onClick: () => {
              setCount(0)
              currentIndex = 0
              setName(names[0])
            },
            style: {
              padding: "8px 16px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }
          })
        ]
      })
    ]
  })
}
