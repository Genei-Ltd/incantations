import type { ElementType, IncantationElement } from './types'
import { ELEMENT_BRAND, FRAGMENT } from './types'

export type { JSX } from './types'

export const Fragment = FRAGMENT

export function isElement(value: unknown): value is IncantationElement {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<symbol, unknown>)[ELEMENT_BRAND] === true
  )
}

export function jsx(
  type: ElementType,
  props: Record<string, unknown>,
  key?: string,
): IncantationElement {
  return {
    [ELEMENT_BRAND]: true as const,
    type,
    props,
    key: key ?? null,
  }
}

// jsxs is identical — React distinguishes for DevTools static child detection,
// which is meaningless for a text-rendering library.
export const jsxs: (
  type: ElementType,
  props: Record<string, unknown>,
  key?: string,
) => IncantationElement = jsx
