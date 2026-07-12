import { h } from "organic-ui"
import { cn } from "../lib/utils.js"

export interface LabelProps {
  class?: string
  children?: any
  htmlFor?: string
}

export function Label({
  class: className,
  children,
  ...props
}: LabelProps) {
  const labelProps: any = {
    class: cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    ),
    ...props
  }
  
  // Handle string children
  if (typeof children === 'string') {
    labelProps.text = children
  } else if (children) {
    labelProps.children = Array.isArray(children) ? children : [children]
  }
  
  return h.label(labelProps)
}
