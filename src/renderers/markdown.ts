import type { Renderer } from './types'
import { listPrefix } from './list'

function formatAttrs(attrs: Record<string, unknown>): string {
  const entries = Object.entries(attrs).filter(
    ([, v]) => v != null && v !== false,
  )
  if (entries.length === 0) return ''
  const parts = entries.map(([k, v]) => (v === true ? k : `${k}=${String(v)}`))
  return ` (${parts.join(', ')})`
}

export const markdownRenderer: Renderer = {
  renderTag(name, attrs, content) {
    const attrStr = formatAttrs(attrs)
    return `## ${name}${attrStr}\n\n${content}`
  },

  renderSelfClosingTag(name, _attrs) {
    if (name === 'separator' || name === 'hr') {
      return '---'
    }
    return `## ${name}`
  },

  renderList(items, _style, _depth) {
    return items.join('\n')
  },

  renderListItem(content, style, index, depth) {
    const indent = '  '.repeat(depth)
    const prefix = listPrefix(style, index)
    return `${indent}${prefix}${content}`
  },
}
