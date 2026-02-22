// Runtime brand symbol — used to identify IncantationElements
export const ELEMENT_BRAND: unique symbol = Symbol('incantation.element')

// Fragment symbol — used for <>...</> syntax
export const FRAGMENT: unique symbol = Symbol.for(
  'incantation.fragment',
) as unknown as typeof FRAGMENT

// ---- Core types ----

export type ComponentFunction = (
  props: Record<string, unknown>,
) => IncantationNode

export type ElementType = string | ComponentFunction | typeof FRAGMENT

export type IncantationElement = {
  readonly [ELEMENT_BRAND]: true
  readonly type: ElementType
  readonly props: Record<string, unknown>
  readonly key: string | null
}

export type IncantationNode =
  | IncantationElement
  | string
  | number
  | boolean
  | null
  | undefined
  | IncantationNode[]

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PropsWithChildren<P = {}> = P & {
  children?: IncantationNode
}

// ---- JSX namespace ----
// TypeScript requires a `namespace JSX` for JSX type checking — no alternative exists.
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace JSX {
  type Element = IncantationElement

  // TS 5.1+: Allow components to return any IncantationNode, not just Element | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ElementType = string | ((props: any) => IncantationNode)

  // Allow `key` on any JSX element without requiring it in component props
  type IntrinsicAttributes = { key?: string | number }

  type ElementChildrenAttribute = { children: IncantationNode }

  type IntrinsicElements = Record<
    string,
    Record<string, unknown> & { children?: IncantationNode }
  >
}
