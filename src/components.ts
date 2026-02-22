import type { IncantationNode, PropsWithChildren } from './types'
import { useRenderContext } from './context'

// ---- Component identity symbols ----

export const LIST_ID = Symbol.for('incantation.list')
export const ITEM_ID = Symbol.for('incantation.item')
export const RAW_ID = Symbol.for('incantation.raw')

// ---- Types ----

export type ConcreteListStyle =
  | 'bulleted'
  | 'numbered'
  | 'alpha'
  | 'roman'
  | 'none'

export type ListStyle = ConcreteListStyle | 'outline'

export type ListProps = PropsWithChildren<{ style?: ListStyle }>

export type ItemProps = PropsWithChildren

export type RawProps = PropsWithChildren

export type WhenProps = PropsWithChildren<{
  provider?: string | string[]
  model?: string | string[]
}>

// ---- Component type with identity brand ----

type BrandedComponent<P> = ((props: P) => IncantationNode) & {
  _componentId: symbol
}

// ---- Components ----

export const List: BrandedComponent<ListProps> = Object.assign(
  function List(_props: ListProps): IncantationNode {
    return null
  },
  { _componentId: LIST_ID },
)

export const Item: BrandedComponent<ItemProps> = Object.assign(
  function Item(_props: ItemProps): IncantationNode {
    return null
  },
  { _componentId: ITEM_ID },
)

export const Raw: BrandedComponent<RawProps> = Object.assign(
  function Raw(_props: RawProps): IncantationNode {
    return null
  },
  { _componentId: RAW_ID },
)

export function When({
  provider,
  model,
  children,
}: WhenProps): IncantationNode {
  const ctx = useRenderContext()

  if (provider != null) {
    const providers = Array.isArray(provider) ? provider : [provider]
    if (ctx.provider == null || !providers.includes(ctx.provider)) {
      return null
    }
  }

  if (model != null) {
    const models = Array.isArray(model) ? model : [model]
    if (ctx.model == null || !models.includes(ctx.model)) {
      return null
    }
  }

  return children ?? null
}
