import type { IncantationElement, IncantationNode } from './types'
import { FRAGMENT } from './types'
import type { Renderer } from './renderers/types'
import type { ConcreteListStyle, ListStyle } from './components'
import { LIST_ID, ITEM_ID, RAW_ID } from './components'
import { xmlRenderer } from './renderers/xml'
import { isElement } from './jsx-runtime'
import { processTextChildren } from './text'

// ---- Public API ----

export function render(
  node: IncantationNode,
  renderer: Renderer = xmlRenderer,
): string {
  return renderNode(node, renderer, { listContext: null })
}

// ---- Internal types ----

type RenderContext = {
  listContext: { style: ListStyle; index: number; depth: number } | null
}

// ---- Tree walker ----

function renderNode(
  node: IncantationNode,
  renderer: Renderer,
  ctx: RenderContext,
): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'number') return String(node)
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return renderChildren(node, renderer, ctx)
  if (isElement(node)) return renderElement(node, renderer, ctx)

  throw new Error(
    `Unexpected node type in render tree: ${typeof node}. ` +
      'Expected string, number, null, boolean, array, or IncantationElement.',
  )
}

function renderElement(
  element: IncantationElement,
  renderer: Renderer,
  ctx: RenderContext,
): string {
  const { type } = element

  // Fragment
  if (type === FRAGMENT) {
    const children = normalizeChildren(
      element.props.children as IncantationNode,
    )
    return renderChildren(children, renderer, ctx)
  }

  // Component function
  if (typeof type === 'function') {
    return renderComponent(element, renderer, ctx)
  }

  // Intrinsic element (string tag name)
  if (typeof type === 'string') {
    return renderIntrinsic(element, renderer, ctx)
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
  ctx: RenderContext,
): string {
  const id = getComponentId(element.type as (...args: unknown[]) => unknown)

  // Built-in: List
  if (id === LIST_ID) {
    return renderList(element, renderer, ctx)
  }

  // Built-in: Item
  if (id === ITEM_ID) {
    return renderItem(element, renderer, ctx)
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
  return renderNode(result, renderer, ctx)
}

// ---- Intrinsic element rendering ----

function renderIntrinsic(
  element: IncantationElement,
  renderer: Renderer,
  ctx: RenderContext,
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
    return renderer.renderSelfClosingTag(tagName, attrs)
  }

  const inner = renderChildren(children, renderer, ctx)
  return renderer.renderTag(tagName, attrs, inner)
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
  ctx: RenderContext,
): string {
  const rawStyle =
    (element.props.style as ListStyle | undefined) ??
    ctx.listContext?.style ??
    'bulleted'
  const children = normalizeChildren(element.props.children as IncantationNode)
  const depth = ctx.listContext != null ? ctx.listContext.depth + 1 : 0
  const concrete = resolveListStyle(rawStyle, depth)

  const items: string[] = []
  let index = 0

  for (const child of children) {
    if (child == null || typeof child === 'boolean') continue

    const result = renderNode(child, renderer, {
      ...ctx,
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
  ctx: RenderContext,
): string {
  const children = normalizeChildren(element.props.children as IncantationNode)
  const inner = renderChildren(children, renderer, ctx)

  if (ctx.listContext == null) {
    return inner
  }

  const concrete = resolveListStyle(
    ctx.listContext.style,
    ctx.listContext.depth,
  )
  return renderer.renderListItem(
    inner,
    concrete,
    ctx.listContext.index,
    ctx.listContext.depth,
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
  ctx: RenderContext,
): string {
  const processed = processTextChildren(children)
  const rendered: string[] = []

  for (const child of processed) {
    const result = renderNode(child, renderer, ctx)
    if (result !== '') {
      rendered.push(result)
    }
  }

  return rendered.join('\n')
}
