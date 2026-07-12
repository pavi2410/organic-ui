import { h, state, Switch } from "organic-ui"
import { CodeViewer } from "./CodeViewer.js"

type Tab = "preview" | "code"

interface ExampleTabsProps {
  preview: () => any
  code: string
}

export function ExampleTabs({ preview, code }: ExampleTabsProps) {
  const [activeTab, setActiveTab] = state<Tab>("preview")

  const tabButtonStyle = (isActive: boolean) => ({
    padding: "10px 20px",
    background: isActive ? "white" : "#f0f0f0",
    color: isActive ? "#007bff" : "#666",
    border: "none",
    borderBottom: isActive ? "2px solid #007bff" : "2px solid transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: isActive ? "600" : "normal",
    transition: "all 0.2s ease"
  })

  return h.div({
    style: {
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      overflow: "hidden",
      marginBottom: "20px"
    },
    children: [
      // Tab buttons
      h.div({
        style: {
          display: "flex",
          borderBottom: "1px solid #e0e0e0",
          background: "#f8f9fa"
        },
        children: [
          h.button({
            text: "Preview",
            onClick: () => setActiveTab("preview"),
            style: () => tabButtonStyle(activeTab() === "preview")
          }),
          h.button({
            text: "Code",
            onClick: () => setActiveTab("code"),
            style: () => tabButtonStyle(activeTab() === "code")
          })
        ]
      }),
      // Tab content
      h.div({
        style: {
          padding: "20px",
          background: "white",
          minHeight: "150px"
        },
        children: [
          Switch({
            on: activeTab,
            cases: [
              {
                when: "preview",
                children: preview()
              },
              {
                when: "code",
                children: CodeViewer({ code, language: "typescript" })
              }
            ]
          })
        ]
      })
    ]
  })
}

