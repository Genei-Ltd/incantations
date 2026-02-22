import { describe, expect, it } from 'vitest'
import { render, List, Item, isElement } from '../src/index'

describe('render', () => {
  describe('intrinsic elements', () => {
    it('renders a simple tag with text', () => {
      expect(render(<system>hello</system>)).toBe('<system>\nhello\n</system>')
    })

    it('renders a self-closing tag', () => {
      expect(render(<separator />)).toBe('<separator />')
    })

    it('renders attributes', () => {
      expect(render(<context source="docs">text</context>)).toBe(
        '<context source="docs">\ntext\n</context>',
      )
    })

    it('renders boolean true attributes as bare names', () => {
      expect(render(<section important>text</section>)).toBe(
        '<section important>\ntext\n</section>',
      )
    })

    it('omits boolean false attributes', () => {
      expect(render(<section important={false}>text</section>)).toBe(
        '<section>\ntext\n</section>',
      )
    })

    it('renders nested tags', () => {
      const result = render(
        <system>
          <context>inner</context>
        </system>,
      )
      expect(result).toBe('<system>\n<context>\ninner\n</context>\n</system>')
    })

    it('escapes attribute values', () => {
      expect(render(<tag attr={'a"b<c>&d'}>text</tag>)).toBe(
        '<tag attr="a&quot;b&lt;c&gt;&amp;d">\ntext\n</tag>',
      )
    })

    it('strips key from output', () => {
      const result = render(<system key="k1">text</system>)
      expect(result).not.toContain('key=')
    })
  })

  describe('component functions', () => {
    it('renders a simple component', () => {
      function Greeting({ name }: { name: string }) {
        return <system>Hello, {name}!</system>
      }
      const result = render(<Greeting name="world" />)
      expect(result).toBe('<system>\nHello, world!\n</system>')
    })

    it('renders nested components', () => {
      function Inner() {
        return <inner>deep</inner>
      }
      function Middle() {
        return <Inner />
      }
      function Outer() {
        return <Middle />
      }
      expect(render(<Outer />)).toBe('<inner>\ndeep\n</inner>')
    })

    it('handles component returning null', () => {
      function Empty() {
        return null
      }
      expect(render(<Empty />)).toBe('')
    })

    it('passes children to components', () => {
      function Wrapper({ children }: { children?: unknown }) {
        return <wrapper>{children as string}</wrapper>
      }
      expect(render(<Wrapper>content</Wrapper>)).toBe(
        '<wrapper>\ncontent\n</wrapper>',
      )
    })
  })

  describe('fragments', () => {
    it('renders fragments', () => {
      const result = render(
        <>
          <system>one</system>
          <context>two</context>
        </>,
      )
      expect(result).toBe(
        '<system>\none\n</system>\n<context>\ntwo\n</context>',
      )
    })

    it('renders empty fragment as empty string', () => {
      expect(render(<></>)).toBe('')
    })
  })

  describe('children handling', () => {
    it('filters out null children', () => {
      const result = render(<system>{null}hello</system>)
      expect(result).toBe('<system>\nhello\n</system>')
    })

    it('filters out undefined children', () => {
      const result = render(<system>{undefined}hello</system>)
      expect(result).toBe('<system>\nhello\n</system>')
    })

    it('filters out boolean children', () => {
      const result = render(
        <system>
          {true}
          {false}
          hello
        </system>,
      )
      expect(result).toBe('<system>\nhello\n</system>')
    })

    it('renders number children', () => {
      const result = render(<system>{42}</system>)
      expect(result).toBe('<system>\n42\n</system>')
    })

    it('concatenates adjacent text', () => {
      const name = 'world'
      const result = render(<system>Hello, {name}!</system>)
      expect(result).toBe('<system>\nHello, world!\n</system>')
    })

    it('handles conditional rendering', () => {
      const show = false
      const result = render(
        <system>
          {show && <context>hidden</context>}
          visible
        </system>,
      )
      expect(result).not.toContain('hidden')
      expect(result).toContain('visible')
    })

    it('handles array map', () => {
      const items = ['a', 'b', 'c']
      const result = render(
        <List style="numbered">
          {items.map((item, i) => (
            <Item key={i}>{item}</Item>
          ))}
        </List>,
      )
      expect(result).toBe('1. a\n2. b\n3. c')
    })
  })

  describe('text processing', () => {
    it('JSX collapses multiline inline text to single line', () => {
      // Standard JSX behavior: whitespace between lines becomes a single space
      const result = render(
        <system>You are a helpful assistant. Always be concise.</system>,
      )
      expect(result).toBe(
        '<system>\nYou are a helpful assistant. Always be concise.\n</system>',
      )
    })

    it('preserves newlines in template literals', () => {
      const result = render(
        <system>{`You are a helpful assistant.\nAlways be concise.`}</system>,
      )
      expect(result).toBe(
        '<system>\nYou are a helpful assistant.\nAlways be concise.\n</system>',
      )
    })

    it('trims and dedents template literal content', () => {
      const result = render(
        <system>
          {`
            You are a helpful assistant.
            Always be concise.
          `}
        </system>,
      )
      expect(result).toBe(
        '<system>\nYou are a helpful assistant.\nAlways be concise.\n</system>',
      )
    })
  })
})

describe('isElement', () => {
  it('returns true for JSX elements', () => {
    expect(isElement(<system>test</system>)).toBe(true)
  })

  it('returns false for strings', () => {
    expect(isElement('hello')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isElement(null)).toBe(false)
  })

  it('returns false for plain objects', () => {
    expect(isElement({ type: 'div' })).toBe(false)
  })
})
