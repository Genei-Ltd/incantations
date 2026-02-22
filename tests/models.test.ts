import { describe, expect, it } from 'vitest'
import { inferProvider, getDefaultRenderer } from '../src/models'
import { xmlRenderer } from '../src/renderers/xml'
import { markdownRenderer } from '../src/renderers/markdown'

describe('inferProvider', () => {
  it('infers anthropic from claude models', () => {
    expect(inferProvider('claude-sonnet-4-20250514')).toBe('anthropic')
    expect(inferProvider('claude-3-haiku-20240307')).toBe('anthropic')
    expect(inferProvider('claude-opus-4-20250514')).toBe('anthropic')
  })

  it('infers openai from gpt models', () => {
    expect(inferProvider('gpt-4o')).toBe('openai')
    expect(inferProvider('gpt-4-turbo')).toBe('openai')
    expect(inferProvider('gpt-3.5-turbo')).toBe('openai')
  })

  it('infers openai from o-series models', () => {
    expect(inferProvider('o1-preview')).toBe('openai')
    expect(inferProvider('o3-mini')).toBe('openai')
    expect(inferProvider('o4-mini')).toBe('openai')
  })

  it('infers openai from chatgpt models', () => {
    expect(inferProvider('chatgpt-4o-latest')).toBe('openai')
  })

  it('infers google from gemini and gemma models', () => {
    expect(inferProvider('gemini-pro')).toBe('google')
    expect(inferProvider('gemini-1.5-flash')).toBe('google')
    expect(inferProvider('gemma-7b')).toBe('google')
  })

  it('is case insensitive', () => {
    expect(inferProvider('CLAUDE-SONNET')).toBe('anthropic')
    expect(inferProvider('GPT-4o')).toBe('openai')
    expect(inferProvider('Gemini-Pro')).toBe('google')
  })

  it('returns null for unknown models', () => {
    expect(inferProvider('unknown-model')).toBeNull()
    expect(inferProvider('llama-3-70b')).toBeNull()
    expect(inferProvider('mistral-large')).toBeNull()
  })
})

describe('getDefaultRenderer', () => {
  it('returns xmlRenderer for anthropic', () => {
    expect(getDefaultRenderer('anthropic')).toBe(xmlRenderer)
  })

  it('returns markdownRenderer for openai', () => {
    expect(getDefaultRenderer('openai')).toBe(markdownRenderer)
  })

  it('returns markdownRenderer for google', () => {
    expect(getDefaultRenderer('google')).toBe(markdownRenderer)
  })

  it('returns xmlRenderer for null provider', () => {
    expect(getDefaultRenderer(null)).toBe(xmlRenderer)
  })

  it('returns xmlRenderer for unknown provider', () => {
    expect(getDefaultRenderer('unknown')).toBe(xmlRenderer)
  })
})
