import { h } from "organic-ui"
import { Button, Input, Card, Label, Textarea, Checkbox } from "organic-components"
import { CodeViewer } from "../components/CodeViewer.js"

export function Components() {

  return h.div({
    children: [
      h.div({
        text: "Components",
        class: "docs-page-title"
      }),
      h.p({
        text: "Pre-built UI components styled with Tailwind CSS for common use cases.",
        class: "docs-text"
      }),
      h.div({
        text: "Button",
        class: "docs-subsection-title"
      }),
      h.p({
        text: "A customizable button component with variants and sizes.",
        class: "docs-text"
      }),
      h.div({
        class: "docs-example",
        style: { 
          padding: "20px", 
          border: "1px solid #e2e8f0", 
          borderRadius: "8px", 
          marginBottom: "16px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap"
        },
        children: [
          Button({
            variant: "default",
            children: "Default"
          }),
          Button({
            variant: "secondary",
            children: "Secondary"
          }),
          Button({
            variant: "outline",
            children: "Outline"
          }),
          Button({
            variant: "ghost",
            children: "Ghost"
          }),
          Button({
            variant: "destructive",
            children: "Destructive"
          })
        ]
      }),
      CodeViewer({
        code: `import { Button } from "organic-components"

Button({
  variant: "default",
  size: "default",
  children: "Click me",
  onClick: () => console.log("clicked")
})`,
        language: "typescript"
      }),
      h.div({
        text: "Input",
        class: "docs-subsection-title"
      }),
      h.p({
        text: "A styled input field.",
        class: "docs-text"
      }),
      h.div({
        class: "docs-example",
        style: { 
          padding: "20px", 
          border: "1px solid #e2e8f0", 
          borderRadius: "8px", 
          marginBottom: "16px"
        },
        children: [
          h.div({
            style: { maxWidth: "300px" },
            children: [Input({
              placeholder: "Enter your name..."
            })]
          })
        ]
      }),
      CodeViewer({
        code: `import { Input } from "organic-components"

Input({
  placeholder: "Enter text",
  onInput: (value) => console.log(value)
})`,
        language: "typescript"
      }),
      h.div({
        text: "Card",
        class: "docs-subsection-title"
      }),
      h.p({
        text: "A card component with header, title, description, content, and footer.",
        class: "docs-text"
      }),
      h.div({
        class: "docs-example",
        style: { 
          padding: "20px", 
          border: "1px solid #e2e8f0", 
          borderRadius: "8px", 
          marginBottom: "16px"
        },
        children: [
          h.div({
            style: { maxWidth: "400px" },
            children: [Card.Root({
              children: [
                Card.Header({
                  children: [
                    Card.Title({ children: "Example Card" }),
                    Card.Description({ children: "This is a card description" })
                  ]
                }),
                Card.Content({
                  children: "This is the card content area where you can put any content."
                }),
                Card.Footer({
                  children: "Card footer"
                })
              ]
            })]
          })
        ]
      }),
      CodeViewer({
        code: `import { Card } from "organic-components"

Card.Root({
  children: [
    Card.Header({
      children: [
        Card.Title({ children: "Card Title" }),
        Card.Description({ children: "Card description" })
      ]
    }),
    Card.Content({
      children: "Card content"
    }),
    Card.Footer({
      children: "Card footer"
    })
  ]
})`,
        language: "typescript"
      }),
      h.div({
        text: "Textarea",
        class: "docs-subsection-title"
      }),
      h.p({
        text: "A multi-line text input component.",
        class: "docs-text"
      }),
      h.div({
        class: "docs-example",
        style: { 
          padding: "20px", 
          border: "1px solid #e2e8f0", 
          borderRadius: "8px", 
          marginBottom: "16px"
        },
        children: [
          h.div({
            style: { maxWidth: "400px" },
            children: [Textarea({
              placeholder: "Enter your message here...",
              rows: 4
            })]
          })
        ]
      }),
      CodeViewer({
        code: `import { Textarea } from "organic-components"

Textarea({
  placeholder: "Enter your message",
  rows: 4,
  onInput: (value) => console.log(value)
})`,
        language: "typescript"
      }),
      h.div({
        text: "Checkbox",
        class: "docs-subsection-title"
      }),
      h.p({
        text: "A checkbox input component.",
        class: "docs-text"
      }),
      h.div({
        class: "docs-example",
        style: { 
          padding: "20px", 
          border: "1px solid #e2e8f0", 
          borderRadius: "8px", 
          marginBottom: "16px",
          display: "flex",
          gap: "12px",
          alignItems: "center"
        },
        children: [
          Checkbox({
            checked: false
          }),
          Label({ children: "Accept terms and conditions" })
        ]
      }),
      CodeViewer({
        code: `import { Checkbox } from "organic-components"

Checkbox({
  checked: false,
  onChange: (checked) => console.log(checked)
})`,
        language: "typescript"
      }),
      h.div({
        text: "Radio",
        class: "docs-subsection-title"
      }),
      h.p({
        text: "A radio input component.",
        class: "docs-text"
      }),
      CodeViewer({
        code: `import { Radio } from "organic-components"

Radio({
  name: "option",
  value: "1",
  checked: false,
  onChange: (checked) => console.log(checked)
})`,
        language: "typescript"
      }),
      h.div({
        text: "Switch",
        class: "docs-subsection-title"
      }),
      h.p({
        text: "A toggle switch component.",
        class: "docs-text"
      }),
      CodeViewer({
        code: `import { Switch } from "organic-components"

Switch({
  checked: false,
  onCheckedChange: (checked) => console.log(checked)
})`,
        language: "typescript"
      }),
      h.div({
        text: "Tabs",
        class: "docs-subsection-title"
      }),
      h.p({
        text: "A tabs component for navigation.",
        class: "docs-text"
      }),
      CodeViewer({
        code: `import { Tabs } from "organic-components"

Tabs.Root({
  children: [
    Tabs.List({
      children: [
        Tabs.Trigger({ children: "Tab 1", active: true }),
        Tabs.Trigger({ children: "Tab 2" })
      ]
    }),
    Tabs.Content({ children: "Content for Tab 1", active: true }),
    Tabs.Content({ children: "Content for Tab 2" })
  ]
})`,
        language: "typescript"
      }),
      h.div({
        text: "Alert",
        class: "docs-subsection-title"
      }),
      h.p({
        text: "An alert component for displaying messages.",
        class: "docs-text"
      }),
      CodeViewer({
        code: `import { Alert } from "organic-components"

Alert.Root({
  variant: "default",
  children: [
    Alert.Title({ children: "Alert Title" }),
    Alert.Description({ children: "This is an alert message." })
  ]
})`,
        language: "typescript"
      }),
      h.div({
        text: "Dialog",
        class: "docs-subsection-title"
      }),
      h.p({
        text: "A modal dialog component.",
        class: "docs-text"
      }),
      CodeViewer({
        code: `import { Dialog } from "organic-components"

Dialog.Root({
  open: true,
  children: [
    Dialog.Header({
      children: [
        Dialog.Title({ children: "Dialog Title" }),
        Dialog.Description({ children: "Dialog description" })
      ]
    }),
    Dialog.Content({
      children: "Dialog content"
    }),
    Dialog.Footer({
      children: [
        Dialog.Close({ children: "Close", onClick: () => setOpen(false) })
      ]
    })
  ]
})`,
        language: "typescript"
      }),
      h.div({
        text: "Collapsible",
        class: "docs-subsection-title"
      }),
      h.p({
        text: "A collapsible content component.",
        class: "docs-text"
      }),
      CodeViewer({
        code: `import { Collapsible } from "organic-components"

Collapsible.Root({
  open: true,
  children: [
    Collapsible.Trigger({
      children: "Toggle",
      onClick: () => setOpen(!open)
    }),
    Collapsible.Content({
      children: "Collapsible content",
      open: true
    })
  ]
})`,
        language: "typescript"
      })
    ]
  })
}
