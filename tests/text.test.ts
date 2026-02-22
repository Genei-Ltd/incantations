import { describe, expect, it } from 'vitest'
import { trimAndDedent, processTextChildren } from '../src/text'

describe('trimAndDedent', () => {
  it('trims leading and trailing blank lines', () => {
    expect(trimAndDedent('\n  hello\n')).toBe('hello')
  })

  it('removes common indentation', () => {
    expect(trimAndDedent('\n    hello\n      world\n')).toBe('hello\n  world')
  })

  it('handles single line', () => {
    expect(trimAndDedent('hello')).toBe('hello')
  })

  it('returns empty string for whitespace-only input', () => {
    expect(trimAndDedent('   \n  \n  ')).toBe('')
  })

  it('preserves relative indentation', () => {
    const input = '\n    a\n      b\n        c\n'
    expect(trimAndDedent(input)).toBe('a\n  b\n    c')
  })

  it('handles blank lines in the middle', () => {
    const input = '\n    a\n\n    b\n'
    expect(trimAndDedent(input)).toBe('a\n\nb')
  })

  it('handles empty string', () => {
    expect(trimAndDedent('')).toBe('')
  })

  it('handles string with only newlines', () => {
    expect(trimAndDedent('\n\n\n')).toBe('')
  })
})

describe('processTextChildren', () => {
  it('merges adjacent strings', () => {
    const result = processTextChildren(['hello', ' ', 'world'])
    expect(result).toEqual(['hello world'])
  })

  it('converts numbers to strings and merges with adjacent text', () => {
    const result = processTextChildren(['count: ', 42])
    expect(result).toEqual(['count: 42'])
  })

  it('filters out null, undefined, and booleans', () => {
    const result = processTextChildren([null, undefined, true, false, 'hello'])
    expect(result).toEqual(['hello'])
  })

  it('preserves elements between text segments', () => {
    const element = {
      [Symbol('incantation.element')]: true as const,
      type: 'tag',
      props: {},
      key: null,
    }
    // Use a real element-like object — but for processTextChildren,
    // it just passes through non-string/number/null/boolean/undefined values
    const result = processTextChildren(['before', element as never, 'after'])
    expect(result).toHaveLength(3)
    expect(result[0]).toBe('before')
    expect(result[2]).toBe('after')
  })

  it('returns empty array for all-empty input', () => {
    const result = processTextChildren([null, undefined, false])
    expect(result).toEqual([])
  })

  it('trims and dedents merged text', () => {
    const result = processTextChildren(['\n    hello\n    world\n'])
    expect(result).toEqual(['hello\nworld'])
  })
})
