import { createRoot } from "./reactivity.js"
import { bind, bindAssign, bindAttr } from "./utils/bind.js"
import type { Renderable } from "./types.js"

type Getter<T> = () => T
export type Reactive<T> = T | Getter<T>

type ElOf<K extends keyof HTMLElementTagNameMap> = HTMLElementTagNameMap[K]

type TextOnly = { text: Reactive<string | number>; children?: never }
type ChildrenOnly = { text?: never; children: Renderable[] }
type None = { text?: never; children?: never }

type DataAriaProps = Partial<
  Record<`data-${string}` | `aria-${string}`, Reactive<string | number | boolean>>
>

type OnEventProps<El> = {
  [K in keyof GlobalEventHandlersEventMap as `on${Capitalize<string & K>}`]?: (
    ev: GlobalEventHandlersEventMap[K] & { currentTarget: El }
  ) => void
}

type BaseProps<El> = {
  id?: string
  class?: Reactive<string>
  className?: Reactive<string>
  style?: Reactive<Partial<CSSStyleDeclaration>>
  ref?: (el: El) => void | (() => void)
  attrs?: Partial<Record<string, Reactive<string | number | boolean>>>
} & DataAriaProps

export interface PropAugmentations {
  a: {
    href?: Reactive<string>
    target?: string
    rel?: string
  }
  img: {
    src?: Reactive<string>
    alt?: string
    width?: string | number
    height?: string | number
  }
  input: {
    type?: string
    value?: Reactive<string | number>
    checked?: Reactive<boolean>
    placeholder?: string
    disabled?: Reactive<boolean>
    name?: string
    min?: Reactive<string | number>
    max?: Reactive<string | number>
    step?: Reactive<string | number>
  }
  textarea: {
    value?: Reactive<string>
    placeholder?: string
    disabled?: Reactive<boolean>
    rows?: number
    cols?: number
    name?: string
  }
  select: {
    value?: Reactive<string>
    disabled?: Reactive<boolean>
    name?: string
  }
  label: {
    htmlFor?: string
  }
  form: {
    action?: string
    method?: string
  }
  button: {
    type?: 'button' | 'submit' | 'reset'
    disabled?: Reactive<boolean>
  }
  div: {}
  span: {}
  p: {}
  h1: {}
  h2: {}
  h3: {}
  h4: {}
  h5: {}
  h6: {}
}

type Aug<K extends keyof HTMLElementTagNameMap> =
  K extends keyof PropAugmentations ? PropAugmentations[K] : {}

export type PropsFor<K extends keyof HTMLElementTagNameMap> =
  & BaseProps<ElOf<K>>
  & OnEventProps<ElOf<K>>
  & (TextOnly | ChildrenOnly | None)
  & Aug<K>

type TagShortcut<K extends keyof HTMLElementTagNameMap> = (props?: PropsFor<K>) => Renderable

type TagShortcuts = {
  [K in keyof HTMLElementTagNameMap]: TagShortcut<K>
}

export type H = (<K extends keyof HTMLElementTagNameMap>(tag: K, props?: PropsFor<K>) => Renderable) & TagShortcuts

const baseFactory = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  rawProps?: PropsFor<K>
): Renderable => {
  const props = (rawProps ?? {}) as PropsFor<K>

  return {
    mount(parent: HTMLElement) {
      const el = document.createElement(tag)
      const childUnmounts: Array<() => void> = []
      const removeListeners: Array<() => void> = []
      let refCleanup: void | (() => void)

      for (const key in props as any) {
        if (key.startsWith("on") && key.length > 2) {
          const handler = (props as any)[key]
          if (typeof handler === "function") {
            const type = key.slice(2).toLowerCase()
            el.addEventListener(type, handler as EventListener)
            removeListeners.push(() => el.removeEventListener(type, handler as EventListener))
          }
        }
      }

      if ((props as any).id) (el as any).id = (props as any).id

      const children = (props as any).children as Renderable[] | undefined
      if (children && children.length) {
        for (const child of children) {
          childUnmounts.push(child.mount(el))
        }
      }

      parent.appendChild(el)

      const root = createRoot(() => {
        const p: any = props

        if (p.text != null) bind(p.text, (v) => { el.textContent = String(v) })

        if (p.class != null) bind(p.class, (v) => { (el as any).className = v })
        if (p.className != null) bind(p.className, (v) => { (el as any).className = v })

        if (p.style != null) bindAssign(p.style, (el as HTMLElement).style)

        if (p.attrs) {
          for (const [name, val] of Object.entries(p.attrs)) {
            bindAttr(el, name, val as any)
          }
        }

        for (const key in p) {
          if (key.startsWith("data-") || key.startsWith("aria-")) {
            bindAttr(el, key, p[key] as any)
          }
        }

        for (const [name, val] of Object.entries(p)) {
          if (
            name === "children" || name === "text" || name === "ref" ||
            name === "style" || name === "class" || name === "className" ||
            name === "attrs" || name.startsWith("on") ||
            name.startsWith("data-") || name.startsWith("aria-") ||
            name === "id"
          ) continue

          if (name in el) {
            bind(val as any, (v: any) => {
              try { (el as any)[name] = v } catch {}
            })
          } else {
            bindAttr(el, name, val as any)
          }
        }

        if (p.ref) refCleanup = p.ref(el as any)
      })

      const dispose = root.dispose
      return () => {
        dispose?.()
        refCleanup?.()
        for (const off of removeListeners) off()
        for (const unmount of childUnmounts) unmount()
        el.remove()
      }
    }
  }
}

export const h = new Proxy(baseFactory as H, {
  get(target, prop: string) {
    if (prop in target) return (target as any)[prop]
    return (props?: any) => baseFactory(prop as any, props)
  }
})
