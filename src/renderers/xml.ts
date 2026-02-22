import type { Renderer } from './types'
import { listPrefix } from './list'

function formatAttrs(attrs: Record<string, unknown>): string {
  const entries = Object.entries(attrs)
  if (entries.length === 0) return ''

  const parts: string[] = []
  for (const [key, value] of entries) {
    if (value === true) {
      parts.push(key)
    } else if (value === false || value == null) {
      continue
    } else if (typeof value === 'string' || typeof value === 'number') {
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
  renderTag(name, attrs, content) {
    const attrStr = formatAttrs(attrs)
    return `<${name}${attrStr}>\n${content}\n</${name}>`
  },

  renderSelfClosingTag(name, attrs) {
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
}
