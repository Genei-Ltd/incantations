import type { ConcreteListStyle } from '../components'

export type Renderer = {
  renderTag(
    name: string,
    attrs: Record<string, unknown>,
    content: string,
  ): string
  renderSelfClosingTag(name: string, attrs: Record<string, unknown>): string
  renderList(items: string[], style: ConcreteListStyle, depth: number): string
  renderListItem(
    content: string,
    style: ConcreteListStyle,
    index: number,
    depth: number,
  ): string
}
