# @coloop-ai/incantations

[![npm version](https://img.shields.io/npm/v/@coloop-ai/incantations.svg)](https://www.npmjs.com/package/@coloop-ai/incantations)
[![npm downloads](https://img.shields.io/npm/dm/@coloop-ai/incantations.svg)](https://www.npmjs.com/package/@coloop-ai/incantations)
[![License: MIT](https://img.shields.io/npm/l/@coloop-ai/incantations.svg)](https://github.com/Genei-Ltd/incantations/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)

Write prompts once, render them optimized for any model. JSX components for LLM prompts with model-aware rendering.

```tsx
import { render, List, Item, When, useProvider } from '@coloop-ai/incantations'

function SystemPrompt() {
  return (
    <system>
      You are a helpful assistant.

      <When provider="anthropic">
        {`Use XML tags to structure your responses.`}
      </When>

      <rules>
        <List style="numbered">
          <Item>Be concise</Item>
          <Item>Be accurate</Item>
        </List>
      </rules>
    </system>
  )
}

render(<SystemPrompt />, { model: 'claude-sonnet-4-20250514' })
render(<SystemPrompt />, { model: 'gpt-4o' })
```

**Claude** gets XML:
```xml
<system>
You are a helpful assistant.
Use XML tags to structure your responses.
<rules>
1. Be concise
2. Be accurate
</rules>
</system>
```

**GPT-4o** gets Markdown:
```markdown
## System

You are a helpful assistant.

### Rules

1. Be concise
2. Be accurate
```

## Installation

```bash
npm install @coloop-ai/incantations
```

Configure JSX in your `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@coloop-ai/incantations"
  }
}
```

## How it works

**Intrinsic elements** — any lowercase tag name becomes a structured text element. Use whatever names make sense for your prompt (`<system>`, `<context>`, `<rules>`, etc.). Attributes, self-closing tags, and nesting all work as you'd expect.

**Components** — plain functions that take props and return `IncantationNode`. Conditional rendering (`{flag && <tag>...</tag>}`) and array mapping work like React.

**Lists** — `<List>` and `<Item>` render structured lists. Styles: `bulleted` (default), `numbered`, `alpha`, `roman`, `none`, and `outline` (cycles numbered/alpha/roman by depth). Nested lists indent automatically.

**Text processing** — template literal content is automatically trimmed and dedented, so your code indentation doesn't leak into prompts.

**Raw** — `<Raw>` passes string children through without any text processing.

## Model-aware rendering

The key insight: different models prefer different prompt formats. Anthropic models understand XML structure. OpenAI models prefer Markdown. `render()` accepts a model or provider and automatically selects the right output format.

```tsx
// Auto-selects renderer based on model
render(<Prompt />, { model: 'claude-sonnet-4-20250514' })  // XML
render(<Prompt />, { model: 'gpt-4o' })               // Markdown
render(<Prompt />, { model: 'gemini-1.5-flash' })      // Markdown

// Or specify provider directly
render(<Prompt />, { provider: 'anthropic' })  // XML
render(<Prompt />, { provider: 'openai' })     // Markdown

// Override with an explicit renderer
render(<Prompt />, { model: 'gpt-4o', renderer: xmlRenderer })
```

### Conditional content with `<When>`

Include content only for specific models or providers:

```tsx
<When provider="anthropic">
  <instructions>Use XML tags to structure your response.</instructions>
</When>

<When provider={['openai', 'google']}>
  Use markdown to structure your response.
</When>

<When model="claude-sonnet-4-20250514">
  Sonnet-specific instructions.
</When>
```

### Context hooks

Access model info inside any component:

```tsx
import { useModel, useProvider, useRenderContext } from '@coloop-ai/incantations'

function AdaptiveComponent() {
  const provider = useProvider()   // 'anthropic' | 'openai' | 'google' | ...
  const model = useModel()         // 'claude-sonnet-4-20250514' | 'gpt-4o' | ...
  const ctx = useRenderContext()   // { model, provider, renderer }

  if (provider === 'anthropic') {
    return <instructions>Use XML tags in your response.</instructions>
  }
  return 'Use markdown in your response.'
}
```

These work like React hooks but with no restrictions — you can call them conditionally, in loops, or from helper functions. They just need to be called during `render()`.

## Composable prompt libraries

Components are plain functions. Publish them as packages and they auto-adapt to whatever model the consumer targets:

```tsx
// @my-org/prompt-components
import { List, Item, useProvider } from '@coloop-ai/incantations'

export function SafetyRules({ rules }: { rules: string[] }) {
  return (
    <safety>
      <List style="numbered">
        {rules.map((rule, i) => <Item key={i}>{rule}</Item>)}
      </List>
    </safety>
  )
}
```

```tsx
// Consumer
import { render } from '@coloop-ai/incantations'
import { SafetyRules } from '@my-org/prompt-components'

const prompt = render(
  <system>
    You are a helpful assistant.
    <SafetyRules rules={['Be truthful', 'Be safe']} />
  </system>,
  { model: 'claude-sonnet-4-20250514' },
)
```

## Renderers

The XML and Markdown renderers are built in. Create custom renderers by overriding any method:

```tsx
import { render, createRenderer } from '@coloop-ai/incantations'

const custom = createRenderer({
  renderTag(name, attrs, content, depth) {
    return `[${name}]\n${content}\n[/${name}]`
  },
})

render(<system>Hello</system>, { renderer: custom })
// [system]
// Hello
// [/system]
```

### XML renderer (default for Anthropic)

- Tags: `<name attr="value">content</name>`
- Self-closing: `<separator />`
- Boolean attrs: `<tag important="true">`
- Attributes are HTML-escaped

### Markdown renderer (default for OpenAI, Google)

- Tags become headings with depth: `##` → `###` → `####` (max `######`)
- Tag names are title-cased: `<user-context>` → `## User Context`
- Attributes render as YAML frontmatter blocks
- Self-closing `<separator />` and `<hr />` become `---`
- Sections separated by double newlines

## Development

```bash
bun install
bun run build     # Build the package
bun run tc        # Type-check
bun run lint      # Lint
bun run test      # Run tests
bun run format    # Check formatting
```

## License

MIT License. See [LICENSE](./LICENSE) for details.
