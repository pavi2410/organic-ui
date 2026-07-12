import { h, state, memo } from "organic-ui"

export function MemoExample() {
  const [firstName, setFirstName] = state("John")
  const [lastName, setLastName] = state("Doe")
  const [age, setAge] = state(25)
  
  const [fullNameComputeCount, setFullNameComputeCount] = state(0)
  const [greetingComputeCount, setGreetingComputeCount] = state(0)
  
  // Memoized computed value - only recomputes when firstName or lastName change
  const fullName = memo(() => {
    setFullNameComputeCount(count => {
      console.log(`Computing fullName (${count + 1} times)`)
      return count + 1
    })
    return `${firstName()} ${lastName()}`
  })
  
  // Another memo that depends on fullName and age
  const greeting = memo(() => {
    setGreetingComputeCount(count => {
      console.log(`Computing greeting (${count + 1} times)`)
      return count + 1
    })
    return `Hello, ${fullName()}! You are ${age()} years old.`
  })
  
  return h.div({
    style: {
      padding: "20px",
      border: "2px solid #3b82f6",
      borderRadius: "8px",
      maxWidth: "500px",
      fontFamily: "sans-serif"
    },
    children: [
      h.div({
        text: "Memo Example",
        style: {
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "16px",
          color: "#2c3e50"
        }
      }),
      
      h.p({
        text: "Open the console to see when memos recompute!",
        style: {
          fontSize: "14px",
          color: "#666",
          marginBottom: "16px",
          fontStyle: "italic"
        }
      }),
      
      // First Name Input
      h.div({
        style: { marginBottom: "12px" },
        children: [
          h.div({
            text: "First Name:",
            style: {
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "4px"
            }
          }),
          h.input({
            type: "text",
            value: firstName,
            onInput: (value) => setFirstName(value),
            style: {
              width: "100%",
              padding: "8px",
              fontSize: "14px",
              border: "1px solid #ddd",
              borderRadius: "4px"
            }
          })
        ]
      }),
      
      // Last Name Input
      h.div({
        style: { marginBottom: "12px" },
        children: [
          h.div({
            text: "Last Name:",
            style: {
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "4px"
            }
          }),
          h.input({
            type: "text",
            value: lastName,
            onInput: (value) => setLastName(value),
            style: {
              width: "100%",
              padding: "8px",
              fontSize: "14px",
              border: "1px solid #ddd",
              borderRadius: "4px"
            }
          })
        ]
      }),
      
      // Age Input
      h.div({
        style: { marginBottom: "16px" },
        children: [
          h.div({
            text: "Age:",
            style: {
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "4px"
            }
          }),
          h.input({
            type: "number",
            value: age,
            onInput: (value) => setAge(Number(value)),
            style: {
              width: "100%",
              padding: "8px",
              fontSize: "14px",
              border: "1px solid #ddd",
              borderRadius: "4px"
            }
          })
        ]
      }),
      
      // Results
      h.div({
        style: {
          padding: "16px",
          backgroundColor: "#f0f9ff",
          borderRadius: "4px",
          border: "1px solid #bae6fd"
        },
        children: [
          h.p({
            text: () => `Full Name: ${fullName()}`,
            style: {
              margin: "0 0 8px 0",
              fontSize: "14px",
              fontWeight: "600"
            }
          }),
          h.p({
            text: () => greeting(),
            style: {
              margin: "0 0 12px 0",
              fontSize: "14px"
            }
          }),
          h.div({
            style: {
              fontSize: "12px",
              color: "#666",
              borderTop: "1px solid #bae6fd",
              paddingTop: "12px"
            },
            children: [
              h.p({
                text: () => `fullName computed: ${fullNameComputeCount()} times`,
                style: { margin: "0 0 4px 0" }
              }),
              h.p({
                text: () => `greeting computed: ${greetingComputeCount()} times`,
                style: { margin: "0" }
              })
            ]
          })
        ]
      }),
      
      h.div({
        style: {
          marginTop: "12px",
          padding: "12px",
          backgroundColor: "#fef3c7",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#92400e"
        },
        children: [
          h.div({
            text: "💡 Try this:",
            style: {
              fontWeight: "600",
              marginBottom: "4px"
            }
          }),
          h.div({
            text: "1. Change age → greeting recomputes, but fullName doesn't!",
            style: { marginBottom: "2px" }
          }),
          h.div({
            text: "2. Change firstName → both fullName and greeting recompute",
            style: { marginBottom: "2px" }
          }),
          h.div({
            text: "3. Check console to see computation logs",
            style: {}
          })
        ]
      })
    ]
  })
}
