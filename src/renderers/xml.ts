import type { Renderer } from './types'
import { listPrefix } from './list'

function formatAttrs(attrs: Record<string, unknown>): string {
  const entries = Object.entries(attrs)
  if (entries.length === 0) return ''

  const parts: string[] = []
  for (const [key, value] of entries) {
    if (value === false || value == null) {
      continue
    } else if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      parts.push(`${key}="${escapeAttrValue(String(value))}"`)
    }
  }

  return parts.length > 0 ? ' ' + parts.join(' ') : ''
}

function escapeAttrValue(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export const xmlRenderer: Renderer = {
  renderTag(name, attrs, content, _depth) {
    const attrStr = formatAttrs(attrs)
    return `<${name}${attrStr}>\n${content}\n</${name}>`
  },

  renderSelfClosingTag(name, attrs, _depth) {
    const attrStr = formatAttrs(attrs)
    return `<${name}${attrStr} />`
  },

  renderList(items, _style, _depth) {
    return items.join('\n')
  },

  renderListItem(content, style, index, depth) {
    const indent = '  '.repeat(depth)
    const prefix = listPrefix(style, index)
    return `${indent}${prefix}${content}`
  },

  joinChildren(parts, _depth) {
    return parts.join('\n')
  },
}
