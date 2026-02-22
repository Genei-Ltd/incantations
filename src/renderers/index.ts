import type { Renderer } from './types'
import { xmlRenderer } from './xml'

export type { Renderer } from './types'
export { xmlRenderer } from './xml'
export { markdownRenderer } from './markdown'

export function createRenderer(overrides: Partial<Renderer>): Renderer {
  return { ...xmlRenderer, ...overrides }
}
