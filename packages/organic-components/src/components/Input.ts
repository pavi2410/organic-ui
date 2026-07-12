import { h } from "organic-ui"
import { cn } from "../lib/utils.js"

export interface InputProps {
  class?: string
  type?: string
  placeholder?: string
  value?: string | number | (() => string | number)
  onInput?: (e: Event) => void
  disabled?: boolean
  [key: string]: any
}

export function Input({
  class: className,
  onInput,
  ...props
}: InputProps) {
  return h.input({
    class: cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props,
    onInput: (e: Event) => {
      onInput?.(e);
      // For two-way binding support
      if (props.value !== undefined && 'target' in e) {
        (e.target as HTMLInputElement).value = String(
          typeof props.value === 'function' ? props.value() : props.value
        );
      }
    }
  } as any)
}
