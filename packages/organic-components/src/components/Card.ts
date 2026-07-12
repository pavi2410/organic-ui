import { h } from "organic-ui"
import { cn } from "../lib/utils.js"

// Helper to convert children to the format expected by h.div
function toChildren(children: any): any {
  if (children == null) return undefined
  if (typeof children === 'string') return undefined // Will use text prop instead
  if (Array.isArray(children)) return children
  return [children]
}

function toText(children: any): string | undefined {
  return typeof children === 'string' ? children : undefined
}

export interface CardProps {
  class?: string
  children?: any
}

function CardRoot({
  class: className,
  children,
  ...props
}: CardProps) {
  const divProps: any = {
    class: cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    ),
    ...props
  }
  
  const text = toText(children)
  if (text) {
    divProps.text = text
  } else {
    divProps.children = toChildren(children)
  }
  
  return h.div(divProps)
}

export interface CardHeaderProps {
  class?: string
  children?: any
}

export function CardHeader({
  class: className,
  children,
  ...props
}: CardHeaderProps) {
  const divProps: any = {
    class: cn("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
  
  const text = toText(children)
  if (text) {
    divProps.text = text
  } else {
    divProps.children = toChildren(children)
  }
  
  return h.div(divProps)
}

export interface CardTitleProps {
  class?: string
  children?: any
}

export function CardTitle({
  class: className,
  children,
  ...props
}: CardTitleProps) {
  const divProps: any = {
    class: cn("text-2xl font-semibold leading-none tracking-tight", className),
    ...props
  }
  
  const text = toText(children)
  if (text) {
    divProps.text = text
  } else {
    divProps.children = toChildren(children)
  }
  
  return h.div(divProps)
}

export interface CardDescriptionProps {
  class?: string
  children?: any
}

export function CardDescription({
  class: className,
  children,
  ...props
}: CardDescriptionProps) {
  const divProps: any = {
    class: cn("text-sm text-muted-foreground", className),
    ...props
  }
  
  const text = toText(children)
  if (text) {
    divProps.text = text
  } else {
    divProps.children = toChildren(children)
  }
  
  return h.div(divProps)
}

export interface CardContentProps {
  class?: string
  children?: any
}

export function CardContent({
  class: className,
  children,
  ...props
}: CardContentProps) {
  const divProps: any = {
    class: cn("p-6 pt-0", className),
    ...props
  }
  
  const text = toText(children)
  if (text) {
    divProps.text = text
  } else {
    divProps.children = toChildren(children)
  }
  
  return h.div(divProps)
}

export interface CardFooterProps {
  class?: string
  children?: any
}

function CardFooter({
  class: className,
  children,
  ...props
}: CardFooterProps) {
  const divProps: any = {
    class: cn("flex items-center p-6 pt-0", className),
    ...props
  }
  
  const text = toText(children)
  if (text) {
    divProps.text = text
  } else {
    divProps.children = toChildren(children)
  }
  
  return h.div(divProps)
}

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter
}
