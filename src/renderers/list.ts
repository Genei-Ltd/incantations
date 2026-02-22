import type { ConcreteListStyle } from '../components'

export function toAlpha(n: number): string {
  let result = ''
  let remaining = n + 1
  while (remaining > 0) {
    remaining--
    result = String.fromCharCode(97 + (remaining % 26)) + result
    remaining = Math.floor(remaining / 26)
  }
  return result
}

const ROMAN_NUMERALS: [number, string][] = [
  [1000, 'm'],
  [900, 'cm'],
  [500, 'd'],
  [400, 'cd'],
  [100, 'c'],
  [90, 'xc'],
  [50, 'l'],
  [40, 'xl'],
  [10, 'x'],
  [9, 'ix'],
  [5, 'v'],
  [4, 'iv'],
  [1, 'i'],
]

export function toRoman(n: number): string {
  let result = ''
  let remaining = n + 1
  for (const [value, numeral] of ROMAN_NUMERALS) {
    while (remaining >= value) {
      result += numeral
      remaining -= value
    }
  }
  return result
}

export function listPrefix(style: ConcreteListStyle, index: number): string {
  switch (style) {
    case 'numbered':
      return `${String(index + 1)}. `
    case 'alpha':
      return `${toAlpha(index)}. `
    case 'roman':
      return `${toRoman(index)}. `
    case 'bulleted':
      return '- '
    case 'none':
      return ''
  }
}
