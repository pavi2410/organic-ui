import { h, state } from "organic-ui"

export function CopyButton(code: string) {
  const [buttonText, setButtonText] = state("Copy")
  const [buttonBg, setButtonBg] = state("#3b82f6")

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setButtonText("✓ Copied!")
      setButtonBg("#10b981")
      setTimeout(() => {
        setButtonText("Copy")
        setButtonBg("#3b82f6")
      }, 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return h.button({
    text: buttonText,
    onClick: handleCopy,
    class: "code-copy-button",
    style: () => ({ background: buttonBg() })
  })
}
