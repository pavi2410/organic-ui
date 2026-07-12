import { h } from "organic-ui"
import { cn } from "../lib/utils.js"

export interface RadioProps {
  class?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  name?: string
  value?: string
}

export function Radio({
  class: className,
  checked,
  onChange,
  ...props
}: RadioProps) {
  return h.input({
    type: "radio",
    class: cn(
      "h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      checked ? "bg-primary text-primary-foreground" : "",
      className
    ),
    checked,
    onChange: (e: Event) => onChange?.((e.target as HTMLInputElement).checked),
    ...props
  } as any)
}
