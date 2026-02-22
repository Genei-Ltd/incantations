import { describe, expect, it } from 'vitest'
import {
  render,
  useRenderContext,
  useModel,
  useProvider,
} from '../src/index'

describe('useRenderContext', () => {
  it('throws when called outside render', () => {
    expect(() => useRenderContext()).toThrow(
      'useRenderContext() must be called during render()',
    )
  })

  it('returns context during render', () => {
    let captured: ReturnType<typeof useRenderContext> | null = null
    function Probe() {
      captured = useRenderContext()
      return null
    }
    render(<Probe />, { model: 'claude-sonnet-4-20250514', provider: 'anthropic' })
    expect(captured).not.toBeNull()
    expect(captured!.model).toBe('claude-sonnet-4-20250514')
    expect(captured!.provider).toBe('anthropic')
    expect(captured!.renderer).toBeDefined()
  })

  it('returns null model/provider when not specified', () => {
    let captured: ReturnType<typeof useRenderContext> | null = null
    function Probe() {
      captured = useRenderContext()
      return null
    }
    render(<Probe />)
    expect(captured!.model).toBeNull()
    expect(captured!.provider).toBeNull()
  })

  it('cleans up context after render', () => {
    function Noop() {
      return null
    }
    render(<Noop />)
    expect(() => useRenderContext()).toThrow()
  })

  it('cleans up context even when a component throws', () => {
    function Boom(): null {
      throw new Error('boom')
    }
    expect(() => render(<Boom />)).toThrow('boom')
    expect(() => useRenderContext()).toThrow(
      'useRenderContext() must be called during render()',
    )
  })
})

describe('useModel', () => {
  it('throws when called outside render', () => {
    expect(() => useModel()).toThrow()
  })

  it('returns model string during render', () => {
    let captured: string | null = null
    function Probe() {
      captured = useModel()
      return null
    }
    render(<Probe />, { model: 'gpt-4o' })
    expect(captured).toBe('gpt-4o')
  })

  it('returns null when no model specified', () => {
    let captured: string | null = 'not-null'
    function Probe() {
      captured = useModel()
      return null
    }
    render(<Probe />)
    expect(captured).toBeNull()
  })
})

describe('useProvider', () => {
  it('throws when called outside render', () => {
    expect(() => useProvider()).toThrow()
  })

  it('returns provider string during render', () => {
    let captured: string | null = null
    function Probe() {
      captured = useProvider()
      return null
    }
    render(<Probe />, { provider: 'anthropic' })
    expect(captured).toBe('anthropic')
  })

  it('returns inferred provider from model', () => {
    let captured: string | null = null
    function Probe() {
      captured = useProvider()
      return null
    }
    render(<Probe />, { model: 'claude-sonnet-4-20250514' })
    expect(captured).toBe('anthropic')
  })

  it('returns null when no provider or model specified', () => {
    let captured: string | null = 'not-null'
    function Probe() {
      captured = useProvider()
      return null
    }
    render(<Probe />)
    expect(captured).toBeNull()
  })
})
