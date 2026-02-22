# @coloop-ai/incantations

[![npm version](https://img.shields.io/npm/v/@coloop-ai/incantations.svg)](https://www.npmjs.com/package/@coloop-ai/incantations)
[![npm downloads](https://img.shields.io/npm/dm/@coloop-ai/incantations.svg)](https://www.npmjs.com/package/@coloop-ai/incantations)
[![License: MIT](https://img.shields.io/npm/l/@coloop-ai/incantations.svg)](https://github.com/Genei-Ltd/incantations/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)

Compose LLM prompts with JSX. Write components, render to XML, Markdown, or any custom format.

```tsx
function SystemPrompt() {
  return (
    <system>
      You are a helpful assistant.
      <rules>
        <List style="numbered">
          <Item>Be concise</Item>
          <Item>Be accurate</Item>
        </List>
      </rules>
    </system>
  )
}

render(<SystemPrompt />)
```

```xml
<system>
You are a helpful assistant.
<rules>
1. Be concise
2. Be accurate
</rules>
</system>
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

## Renderers

`render(node)` uses XML by default. Pass a different renderer as the second argument:

```tsx
import { render, markdownRenderer, createRenderer } from '@coloop-ai/incantations'

// Markdown: tags become headings, <separator /> becomes ---
render(<system>Hello</system>, markdownRenderer)
// ## system
//
// Hello

// Custom: override any of renderTag, renderSelfClosingTag, renderList, renderListItem
const custom = createRenderer({
  renderTag(name, attrs, content) {
    return `**${name}:** ${content}`
  },
})
render(<system>Hello</system>, custom) // **system:** Hello
```

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
