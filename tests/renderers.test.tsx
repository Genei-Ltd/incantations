import { describe, expect, it } from 'vitest'
import {
  render,
  List,
  Item,
  markdownRenderer,
  createRenderer,
} from '../src/index'

describe('markdownRenderer', () => {
  it('renders tags as headings', () => {
    const result = render(<system>Hello</system>, markdownRenderer)
    expect(result).toBe('## system\n\nHello')
  })

  it('renders tags with attributes', () => {
    const result = render(
      <context source="docs">content</context>,
      markdownRenderer,
    )
    expect(result).toBe('## context (source=docs)\n\ncontent')
  })

  it('renders self-closing separator as ---', () => {
    const result = render(<separator />, markdownRenderer)
    expect(result).toBe('---')
  })

  it('renders self-closing hr as ---', () => {
    const result = render(<hr />, markdownRenderer)
    expect(result).toBe('---')
  })

  it('renders other self-closing tags as headings', () => {
    const result = render(<divider />, markdownRenderer)
    expect(result).toBe('## divider')
  })

  it('renders numbered lists', () => {
    const result = render(
      <List style="numbered">
        <Item>A</Item>
        <Item>B</Item>
      </List>,
      markdownRenderer,
    )
    expect(result).toBe('1. A\n2. B')
  })

  it('renders bulleted lists', () => {
    const result = render(
      <List style="bulleted">
        <Item>A</Item>
        <Item>B</Item>
      </List>,
      markdownRenderer,
    )
    expect(result).toBe('- A\n- B')
  })
})

describe('createRenderer', () => {
  it('overrides specific methods', () => {
    const custom = createRenderer({
      renderTag(name, _attrs, content) {
        return `[${name}]\n${content}\n[/${name}]`
      },
    })
    const result = render(<system>Hello</system>, custom)
    expect(result).toBe('[system]\nHello\n[/system]')
  })

  it('falls back to xml defaults for non-overridden methods', () => {
    const custom = createRenderer({
      renderTag(name, _attrs, content) {
        return `--- ${name} ---\n${content}`
      },
    })
    const result = render(
      <>
        <header>Title</header>
        <List style="numbered">
          <Item>A</Item>
        </List>
      </>,
      custom,
    )
    expect(result).toContain('--- header ---')
    expect(result).toContain('1. A')
  })

  it('can create a bold-label renderer', () => {
    const custom = createRenderer({
      renderTag(name, _attrs, content) {
        return `**${name}:** ${content}`
      },
      renderSelfClosingTag(name, _attrs) {
        return `**${name}**`
      },
    })
    expect(render(<system>Hello</system>, custom)).toBe('**system:** Hello')
    expect(render(<separator />, custom)).toBe('**separator**')
  })
})
