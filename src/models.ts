import type { Renderer } from './renderers/types'
import { xmlRenderer } from './renderers/xml'
import { markdownRenderer } from './renderers/markdown'

export type Provider = 'anthropic' | 'openai' | 'google' | (string & {})

const MODEL_PREFIXES: [string, Provider][] = [
  ['claude', 'anthropic'],
  ['gpt', 'openai'],
  ['o1', 'openai'],
  ['o3', 'openai'],
  ['o4', 'openai'],
  ['chatgpt', 'openai'],
  ['gemini', 'google'],
  ['gemma', 'google'],
]

const PROVIDER_RENDERERS: Record<string, Renderer> = {
  anthropic: xmlRenderer,
  openai: markdownRenderer,
  google: markdownRenderer,
}

export function inferProvider(model: string): string | null {
  const lower = model.toLowerCase()
  for (const [prefix, provider] of MODEL_PREFIXES) {
    if (lower.startsWith(prefix)) return provider
  }
  return null
}

export function getDefaultRenderer(provider: string | null): Renderer {
  if (provider != null && provider in PROVIDER_RENDERERS) {
    return PROVIDER_RENDERERS[provider]
  }
  return xmlRenderer
}
