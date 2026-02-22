import { describe, expect, it } from 'vitest'
import {
  render,
  List,
  Item,
  markdownRenderer,
  createRenderer,
} from '../src/index'

describe('markdownRenderer', () => {
  it('renders tags as headings with title case', () => {
    const result = render(<system>Hello</system>, {
      renderer: markdownRenderer,
    })
    expect(result).toBe('## System\n\nHello')
  })

  it('converts kebab-case tag names to title case', () => {
    const result = render(<user-context>content</user-context>, {
      renderer: markdownRenderer,
    })
    expect(result).toBe('## User Context\n\ncontent')
  })

  it('renders nested tags with increasing heading depth', () => {
    const result = render(
      <system>
        <rules>inner</rules>
      </system>,
      { renderer: markdownRenderer },
    )
    expect(result).toBe('## System\n\n### Rules\n\ninner')
  })

  it('renders tags with attributes as YAML frontmatter', () => {
    const result = render(
      <context source="docs">content</context>,
      { renderer: markdownRenderer },
    )
    expect(result).toBe(
      '## Context\n---\nsource: "docs"\n---\n\ncontent',
    )
  })

  it('renders multiple attributes as frontmatter block', () => {
    const result = render(
      <context source="docs" priority="high">
        content
      </context>,
      { renderer: markdownRenderer },
    )
    expect(result).toContain('---\nsource: "docs"\npriority: "high"\n---')
  })

  it('renders boolean true attributes in frontmatter', () => {
    const result = render(<section important>content</section>, {
      renderer: markdownRenderer,
    })
    expect(result).toBe(
      '## Section\n---\nimportant: true\n---\n\ncontent',
    )
  })

  it('renders self-closing separator as ---', () => {
    const result = render(<separator />, { renderer: markdownRenderer })
    expect(result).toBe('---')
  })

  it('renders self-closing hr as ---', () => {
    const result = render(<hr />, { renderer: markdownRenderer })
    expect(result).toBe('---')
  })

  it('renders other self-closing tags as bold title case', () => {
    const result = render(<divider />, { renderer: markdownRenderer })
    expect(result).toBe('**Divider**')
  })

  it('renders numbered lists', () => {
    const result = render(
      <List style="numbered">
        <Item>A</Item>
        <Item>B</Item>
      </List>,
      { renderer: markdownRenderer },
    )
    expect(result).toBe('1. A\n2. B')
  })

  it('renders bulleted lists', () => {
    const result = render(
      <List style="bulleted">
        <Item>A</Item>
        <Item>B</Item>
      </List>,
      { renderer: markdownRenderer },
    )
    expect(result).toBe('- A\n- B')
  })

  it('joins children with double newlines', () => {
    const result = render(
      <system>
        <rules>first</rules>
        <context>second</context>
      </system>,
      { renderer: markdownRenderer },
    )
    expect(result).toBe(
      '## System\n\n### Rules\n\nfirst\n\n### Context\n\nsecond',
    )
  })
})

describe('createRenderer', () => {
  it('overrides specific methods', () => {
    const custom = createRenderer({
      renderTag(name, _attrs, content, _depth) {
        return `[${name}]\n${content}\n[/${name}]`
      },
    })
    const result = render(<system>Hello</system>, { renderer: custom })
    expect(result).toBe('[system]\nHello\n[/system]')
  })

  it('falls back to xml defaults for non-overridden methods', () => {
    const custom = createRenderer({
      renderTag(name, _attrs, content, _depth) {
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
      { renderer: custom },
    )
    expect(result).toContain('--- header ---')
    expect(result).toContain('1. A')
  })

  it('can create a bold-label renderer', () => {
    const custom = createRenderer({
      renderTag(name, _attrs, content, _depth) {
        return `**${name}:** ${content}`
      },
      renderSelfClosingTag(name, _attrs, _depth) {
        return `**${name}**`
      },
    })
    expect(render(<system>Hello</system>, { renderer: custom })).toBe(
      '**system:** Hello',
    )
    expect(render(<separator />, { renderer: custom })).toBe('**separator**')
  })
})
