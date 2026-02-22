import type { IncantationNode } from './types'

/**
 * Process an array of children:
 * 1. Merge adjacent strings/numbers into single strings
 * 2. Apply trim + dedent to each merged text segment
 * 3. Filter out empties
 */
export function processTextChildren(
  children: IncantationNode[],
): IncantationNode[] {
  const result: IncantationNode[] = []
  let pendingText = ''

  for (const child of children) {
    if (typeof child === 'string') {
      pendingText += child
    } else if (typeof child === 'number') {
      pendingText += String(child)
    } else {
      if (pendingText !== '') {
        const processed = trimAndDedent(pendingText)
        if (processed !== '') {
          result.push(processed)
        }
        pendingText = ''
      }
      if (child == null || typeof child === 'boolean') continue
      result.push(child)
    }
  }

  if (pendingText !== '') {
    const processed = trimAndDedent(pendingText)
    if (processed !== '') {
      result.push(processed)
    }
  }

  return result
}

/**
 * Trim leading/trailing blank lines, then remove common leading whitespace.
 *
 *   "\n    Hello\n      World\n" → "Hello\n  World"
 */
export function trimAndDedent(text: string): string {
  const lines = text.split('\n')

  // Trim leading empty lines
  while (lines.length > 0 && lines[0]?.trim() === '') {
    lines.shift()
  }

  // Trim trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1]?.trim() === '') {
    lines.pop()
  }

  if (lines.length === 0) return ''

  // Find minimum indentation across non-empty lines
  let minIndent = Infinity
  for (const line of lines) {
    if (line.trim() === '') continue
    const match = /^(\s*)/.exec(line)
    if (match?.[1] != null) {
      minIndent = Math.min(minIndent, match[1].length)
    }
  }

  if (minIndent === Infinity) minIndent = 0

  // Strip common indentation
  const dedented = lines.map((line) =>
    line.trim() === '' ? '' : line.slice(minIndent),
  )

  return dedented.join('\n')
}
