import { effect } from "../reactivity.js"

/**
 * Helper to bind a reactive or static value to a DOM property
 * Automatically creates an effect if the value is a function
 * 
 * @example
 * bind(text, (value) => { el.textContent = value })
 */
export function bind<T>(
  value: T | (() => T),
  setter: (value: T) => void
): void {
  if (typeof value === "function") {
    effect(() => {
      setter((value as () => T)())
    })
  } else {
    setter(value)
  }
}

/**
 * Helper to bind a reactive or static object to a target using Object.assign
 * Commonly used for styles
 * 
 * @example
 * bindAssign(style, el.style)
 */
export function bindAssign<T extends object>(
  value: T | (() => T),
  target: T
): void {
  if (typeof value === "function") {
    effect(() => {
      Object.assign(target, (value as () => T)())
    })
  } else {
    Object.assign(target, value)
  }
}

/**
 * Helper to bind a reactive or static value to an element attribute
 * Removes the attribute if the value is null, undefined, or false
 * 
 * @example
 * bindAttr(el, 'disabled', () => isDisabled())
 */
export function bindAttr(
  el: Element,
  name: string,
  value: string | number | boolean | (() => string | number | boolean)
): void {
  bind(value, (v) => {
    if (v == null || v === false) {
      el.removeAttribute(name)
    } else {
      el.setAttribute(name, String(v))
    }
  })
}

// TODO: Implement bind(el, obj) for binding multiple properties at once
// Example usage:
// bind(el, {
//   text: () => name(),
//   class: "button",
//   style: () => ({ color: isActive() ? "blue" : "gray" })
// })
