import type { ElementType, IncantationElement } from './types'
import { jsx, Fragment } from './jsx-runtime'

export type { JSX } from './types'

export { Fragment }

export function jsxDEV(
  type: ElementType,
  props: Record<string, unknown>,
  key?: string,
  _isStaticChildren?: boolean,
  _source?: { fileName: string; lineNumber: number; columnNumber: number },
  _self?: unknown,
): IncantationElement {
  return jsx(type, props, key)
}
