import type { Renderer } from './renderers/types'

export type RenderContext = {
  model: string | null
  provider: string | null
  renderer: Renderer
}

let currentContext: RenderContext | null = null

// ---- Internal (not re-exported from index) ----

export function setRenderContext(ctx: RenderContext): void {
  currentContext = ctx
}

export function clearRenderContext(): void {
  currentContext = null
}

// ---- Public hooks ----

export function useRenderContext(): RenderContext {
  if (currentContext == null) {
    throw new Error(
      'useRenderContext() must be called during render(). ' +
        'It can only be used inside component functions.',
    )
  }
  return currentContext
}

export function useModel(): string | null {
  return useRenderContext().model
}

export function useProvider(): string | null {
  return useRenderContext().provider
}
