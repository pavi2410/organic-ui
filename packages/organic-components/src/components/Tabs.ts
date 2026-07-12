import { cva, type VariantProps } from "cva"
import { h } from "organic-ui"
import { cn } from "../lib/utils.js"

const tabsListVariants = cva({
  base: "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
  variants: {},
  defaultVariants: {}
})

export interface TabsListProps {
  class?: string
  children?: any
}

export function TabsList({
  class: className,
  children,
  ...props
}: TabsListProps) {
  return h.div({
    class: cn(tabsListVariants(), className),
    children,
    ...props
  })
}

const tabsTriggerVariants = cva({
  base: "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    active: {
      true: "bg-background text-foreground shadow-sm",
      false: "hover:bg-muted hover:text-foreground"
    }
  },
  defaultVariants: {
    active: false
  }
})

export interface TabsTriggerProps extends VariantProps<typeof tabsTriggerVariants> {
  class?: string
  children?: any
  onClick?: () => void
}

export function TabsTrigger({
  class: className,
  active,
  children,
  onClick,
  ...props
}: TabsTriggerProps) {
  return h.div({
    class: cn(tabsTriggerVariants({ active }), className),
    children,
    onClick,
    ...props
  })
}

export interface TabsContentProps {
  class?: string
  children?: any
  active?: boolean
}

export function TabsContent({
  class: className,
  children,
  active,
  ...props
}: TabsContentProps) {
  return h.div({
    class: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", !active && "hidden", className),
    children,
    ...props
  })
}

// Main Tabs component
export interface TabsProps {
  class?: string
  children?: any
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

function TabsRoot({
  class: className,
  children,
  ...props
}: TabsProps) {
  return h.div({
    class: className,
    children,
    ...props
  })
}

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent
}
