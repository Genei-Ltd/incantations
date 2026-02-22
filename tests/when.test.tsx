import { describe, expect, it } from 'vitest'
import { render, When } from '../src/index'

describe('When', () => {
  describe('provider matching', () => {
    it('renders children when provider matches', () => {
      const result = render(
        <When provider="anthropic">visible</When>,
        { provider: 'anthropic' },
      )
      expect(result).toBe('visible')
    })

    it('renders nothing when provider does not match', () => {
      const result = render(
        <When provider="anthropic">hidden</When>,
        { provider: 'openai' },
      )
      expect(result).toBe('')
    })

    it('renders nothing when no provider in context', () => {
      const result = render(<When provider="anthropic">hidden</When>)
      expect(result).toBe('')
    })

    it('matches against array of providers', () => {
      const result = render(
        <When provider={['anthropic', 'google']}>visible</When>,
        { provider: 'google' },
      )
      expect(result).toBe('visible')
    })

    it('does not match when provider not in array', () => {
      const result = render(
        <When provider={['anthropic', 'google']}>hidden</When>,
        { provider: 'openai' },
      )
      expect(result).toBe('')
    })
  })

  describe('model matching', () => {
    it('renders children when model matches', () => {
      const result = render(
        <When model="gpt-4o">visible</When>,
        { model: 'gpt-4o' },
      )
      expect(result).toBe('visible')
    })

    it('renders nothing when model does not match', () => {
      const result = render(
        <When model="gpt-4o">hidden</When>,
        { model: 'gpt-4-turbo' },
      )
      expect(result).toBe('')
    })

    it('renders nothing when no model in context', () => {
      const result = render(<When model="gpt-4o">hidden</When>)
      expect(result).toBe('')
    })

    it('matches against array of models', () => {
      const result = render(
        <When model={['gpt-4o', 'gpt-4-turbo']}>visible</When>,
        { model: 'gpt-4-turbo' },
      )
      expect(result).toBe('visible')
    })
  })

  describe('combined matching', () => {
    it('requires both provider and model to match (AND logic)', () => {
      const result = render(
        <When provider="anthropic" model="claude-sonnet-4-20250514">
          visible
        </When>,
        { model: 'claude-sonnet-4-20250514', provider: 'anthropic' },
      )
      expect(result).toBe('visible')
    })

    it('renders nothing when provider matches but model does not', () => {
      const result = render(
        <When provider="anthropic" model="claude-opus-4-20250514">hidden</When>,
        { model: 'claude-sonnet-4-20250514', provider: 'anthropic' },
      )
      expect(result).toBe('')
    })
  })

  describe('no conditions', () => {
    it('always renders when no provider or model specified', () => {
      const result = render(<When>always visible</When>)
      expect(result).toBe('always visible')
    })
  })

  describe('nested content', () => {
    it('renders nested elements when condition matches', () => {
      const result = render(
        <When provider="anthropic">
          <instructions>Use XML tags</instructions>
        </When>,
        { provider: 'anthropic' },
      )
      expect(result).toBe('<instructions>\nUse XML tags\n</instructions>')
    })

    it('works inside other elements', () => {
      const result = render(
        <system>
          <When provider="anthropic">anthropic content</When>
          <When provider="openai">openai content</When>
        </system>,
        { provider: 'anthropic' },
      )
      expect(result).toBe('<system>\nanthropic content\n</system>')
    })
  })
})
