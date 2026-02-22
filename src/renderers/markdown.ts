import type { Renderer } from './types'
import { listPrefix } from './list'

function toTitleCase(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatAttrs(attrs: Record<string, unknown>): string {
  const entries = Object.entries(attrs).filter(
    ([, v]) => v != null && v !== false,
  )
  if (entries.length === 0) return ''
  const lines = entries.map(([k, v]) =>
    v === true ? `${k}: true` : `${k}: ${JSON.stringify(v)}`,
  )
  return `\n---\n${lines.join('\n')}\n---`
}

export const markdownRenderer: Renderer = {
  renderTag(name, attrs, content, depth) {
    const level = Math.min(depth + 2, 6)
    const hashes = '#'.repeat(level)
    const title = toTitleCase(name)
    const attrStr = formatAttrs(attrs)
    return `${hashes} ${title}${attrStr}\n\n${content}`
  },

  renderSelfClosingTag(name, attrs, _depth) {
    if (name === 'separator' || name === 'hr') return '---'
    const title = toTitleCase(name)
    const attrStr = formatAttrs(attrs)
    if (attrStr) return `**${title}**${attrStr}`
    return `**${title}**`
  },

  renderList(items, _style, _depth) {
    return items.join('\n')
  },

  renderListItem(content, style, index, depth) {
    const indent = '  '.repeat(depth)
    return `${indent}${listPrefix(style, index)}${content}`
  },

  joinChildren(parts, _depth) {
    return parts.join('\n\n')
  },
}
