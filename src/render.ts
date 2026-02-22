import type { IncantationElement, IncantationNode } from './types'
import { FRAGMENT } from './types'
import type { Renderer } from './renderers/types'
import type { ConcreteListStyle, ListStyle } from './components'
import { LIST_ID, ITEM_ID, RAW_ID } from './components'
import { xmlRenderer } from './renderers/xml'
import { isElement } from './jsx-runtime'
import { processTextChildren } from './text'
import type { RenderContext } from './context'
import { setRenderContext, clearRenderContext } from './context'
import { inferProvider, getDefaultRenderer } from './models'

// ---- Public API ----

export type RenderOptions = {
  model?: string
  provider?: string
  renderer?: Renderer
}

export function render(
  node: IncantationNode,
  options?: RenderOptions,
): string {
  let model: string | null = null
  let provider: string | null = null
  let renderer: Renderer

  if (options == null) {
    renderer = xmlRenderer
  } else {
    model = options.model ?? null
    provider = options.provider ?? null

    if (provider == null && model != null) {
      provider = inferProvider(model)
    }

    renderer = options.renderer ?? getDefaultRenderer(provider)
  }

  const ctx: RenderContext = { model, provider, renderer }
  setRenderContext(ctx)
  try {
    return renderNode(node, renderer, { listContext: null, elementDepth: 0 })
  } finally {
    clearRenderContext()
  }
}

// ---- Internal types ----

type RenderState = {
  listContext: { style: ListStyle; index: number; depth: number } | null
  elementDepth: number
}

// ---- Tree walker ----

function renderNode(
  node: IncantationNode,
  renderer: Renderer,
  state: RenderState,
): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'number') return String(node)
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return renderChildren(node, renderer, state)
  if (isElement(node)) return renderElement(node, renderer, state)

  throw new Error(
    `Unexpected node type in render tree: ${typeof node}. ` +
      'Expected string, number, null, boolean, array, or IncantationElement.',
  )
}

function renderElement(
  element: IncantationElement,
  renderer: Renderer,
  state: RenderState,
): string {
  const { type } = element

  // Fragment
  if (type === FRAGMENT) {
    const children = normalizeChildren(
      element.props.children as IncantationNode,
    )
    return renderChildren(children, renderer, state)
  }

  // Component function
  if (typeof type === 'function') {
    return renderComponent(element, renderer, state)
  }

  // Intrinsic element (string tag name)
  if (typeof type === 'string') {
    return renderIntrinsic(element, renderer, state)
  }

  throw new Error(`Unknown element type: ${String(type)}`)
}

// ---- Component resolution ----

function getComponentId(
  fn: ((...args: unknown[]) => unknown) & { _componentId?: symbol },
): symbol | undefined {
  return fn._componentId
}

function renderComponent(
  element: IncantationElement,
  renderer: Renderer,
  state: RenderState,
): string {
  const id = getComponentId(element.type as (...args: unknown[]) => unknown)

  // Built-in: List
  if (id === LIST_ID) {
    return renderList(element, renderer, state)
  }

  // Built-in: Item
  if (id === ITEM_ID) {
    return renderItem(element, renderer, state)
  }

  // Built-in: Raw
  if (id === RAW_ID) {
    return renderRaw(element)
  }

  // User component: call it
  const propsWithoutKey: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(element.props)) {
    if (k !== 'key') propsWithoutKey[k] = v
  }
  const result = (
    element.type as (props: Record<string, unknown>) => IncantationNode
  )(propsWithoutKey)
  // Process through renderChildren so text gets trimmed/dedented
  const children = normalizeChildren(result)
  return renderChildren(children, renderer, state)
}

// ---- Intrinsic element rendering ----

function renderIntrinsic(
  element: IncantationElement,
  renderer: Renderer,
  state: RenderState,
): string {
  const tagName = element.type as string
  const attrs: Record<string, unknown> = {}
  let rawChildren: IncantationNode = undefined

  for (const [key, value] of Object.entries(element.props)) {
    if (key === 'children') {
      rawChildren = value as IncantationNode
    } else if (key === 'key') {
      continue
    } else {
      attrs[key] = value
    }
  }

  const children = normalizeChildren(rawChildren)

  if (children.length === 0) {
    return renderer.renderSelfClosingTag(tagName, attrs, state.elementDepth)
  }

  const inner = renderChildren(children, renderer, {
    ...state,
    elementDepth: state.elementDepth + 1,
  })
  return renderer.renderTag(tagName, attrs, inner, state.elementDepth)
}

// ---- Built-in component rendering ----

const OUTLINE_CYCLE: ConcreteListStyle[] = ['numbered', 'alpha', 'roman']

function resolveListStyle(style: ListStyle, depth: number): ConcreteListStyle {
  if (style === 'outline') {
    // OUTLINE_CYCLE is non-empty so modulo always yields a valid index
    return OUTLINE_CYCLE[depth % OUTLINE_CYCLE.length] ?? 'numbered'
  }
  return style
}

function renderList(
  element: IncantationElement,
  renderer: Renderer,
  state: RenderState,
): string {
  const rawStyle =
    (element.props.style as ListStyle | undefined) ??
    state.listContext?.style ??
    'bulleted'
  const children = normalizeChildren(element.props.children as IncantationNode)
  const depth = state.listContext != null ? state.listContext.depth + 1 : 0
  const concrete = resolveListStyle(rawStyle, depth)

  const items: string[] = []
  let index = 0

  for (const child of children) {
    if (child == null || typeof child === 'boolean') continue

    const result = renderNode(child, renderer, {
      ...state,
      listContext: { style: rawStyle, index, depth },
    })

    if (result !== '') {
      items.push(result)
      index++
    }
  }

  return renderer.renderList(items, concrete, depth)
}

function renderItem(
  element: IncantationElement,
  renderer: Renderer,
  state: RenderState,
): string {
  const children = normalizeChildren(element.props.children as IncantationNode)
  const inner = renderChildren(children, renderer, state)

  if (state.listContext == null) {
    return inner
  }

  const concrete = resolveListStyle(
    state.listContext.style,
    state.listContext.depth,
  )
  return renderer.renderListItem(
    inner,
    concrete,
    state.listContext.index,
    state.listContext.depth,
  )
}

function renderRaw(element: IncantationElement): string {
  const children = normalizeChildren(element.props.children as IncantationNode)
  return children.filter((c): c is string => typeof c === 'string').join('')
}

// ---- Helpers ----

function normalizeChildren(children: IncantationNode): IncantationNode[] {
  if (children == null) return []
  if (Array.isArray(children))
    return (children as unknown[]).flat(Infinity) as IncantationNode[]
  return [children]
}

function renderChildren(
  children: IncantationNode[],
  renderer: Renderer,
  state: RenderState,
): string {
  const processed = processTextChildren(children)
  const rendered: string[] = []

  for (const child of processed) {
    const result = renderNode(child, renderer, state)
    if (result !== '') {
      rendered.push(result)
    }
  }

  return renderer.joinChildren(rendered, state.elementDepth)
}
