import { describe, expect, it } from 'vitest'
import { render, List, Item, Raw } from '../src/index'

describe('List', () => {
  it('renders a numbered list', () => {
    const result = render(
      <List style="numbered">
        <Item>First</Item>
        <Item>Second</Item>
        <Item>Third</Item>
      </List>,
    )
    expect(result).toBe('1. First\n2. Second\n3. Third')
  })

  it('renders a bulleted list', () => {
    const result = render(
      <List style="bulleted">
        <Item>A</Item>
        <Item>B</Item>
      </List>,
    )
    expect(result).toBe('- A\n- B')
  })

  it('renders a bare list (style=none)', () => {
    const result = render(
      <List style="none">
        <Item>A</Item>
        <Item>B</Item>
      </List>,
    )
    expect(result).toBe('A\nB')
  })

  it('defaults to bulleted style', () => {
    const result = render(
      <List>
        <Item>A</Item>
      </List>,
    )
    expect(result).toBe('- A')
  })

  it('handles empty list', () => {
    const result = render(<List></List>)
    expect(result).toBe('')
  })

  it('skips null items', () => {
    const show = false
    const result = render(
      <List style="numbered">
        <Item>Always</Item>
        {show && <Item>Never</Item>}
        <Item>Also always</Item>
      </List>,
    )
    expect(result).toBe('1. Always\n2. Also always')
  })

  it('renders list inside a tag', () => {
    const result = render(
      <rules>
        <List style="numbered">
          <Item>Be concise</Item>
          <Item>Be accurate</Item>
        </List>
      </rules>,
    )
    expect(result).toBe('<rules>\n1. Be concise\n2. Be accurate\n</rules>')
  })

  it('renders nested lists with indentation', () => {
    const result = render(
      <List style="numbered">
        <Item>Outer one</Item>
        <Item>
          Outer two
          <List style="bulleted">
            <Item>Inner a</Item>
            <Item>Inner b</Item>
          </List>
        </Item>
        <Item>Outer three</Item>
      </List>,
    )
    expect(result).toBe(
      [
        '1. Outer one',
        '2. Outer two',
        '  - Inner a',
        '  - Inner b',
        '3. Outer three',
      ].join('\n'),
    )
  })

  it('renders deeply nested lists', () => {
    const result = render(
      <List style="numbered">
        <Item>
          Level 0
          <List style="bulleted">
            <Item>
              Level 1
              <List style="roman">
                <Item>Level 2</Item>
              </List>
            </Item>
          </List>
        </Item>
      </List>,
    )
    expect(result).toBe(
      ['1. Level 0', '  - Level 1', '    i. Level 2'].join('\n'),
    )
  })

  it('renders alpha style', () => {
    const result = render(
      <List style="alpha">
        <Item>First</Item>
        <Item>Second</Item>
        <Item>Third</Item>
      </List>,
    )
    expect(result).toBe('a. First\nb. Second\nc. Third')
  })

  it('renders roman style', () => {
    const result = render(
      <List style="roman">
        <Item>First</Item>
        <Item>Second</Item>
        <Item>Third</Item>
        <Item>Fourth</Item>
      </List>,
    )
    expect(result).toBe('i. First\nii. Second\niii. Third\niv. Fourth')
  })

  it('renders outline style cycling numbered → alpha → roman', () => {
    const result = render(
      <List style="outline">
        <Item>
          Top level
          <List>
            <Item>
              Second level
              <List>
                <Item>Third level</Item>
              </List>
            </Item>
          </List>
        </Item>
        <Item>Top again</Item>
      </List>,
    )
    expect(result).toBe(
      [
        '1. Top level',
        '  a. Second level',
        '    i. Third level',
        '2. Top again',
      ].join('\n'),
    )
  })

  it('outline cycles back to numbered at depth 3', () => {
    const result = render(
      <List style="outline">
        <Item>
          D0
          <List>
            <Item>
              D1
              <List>
                <Item>
                  D2
                  <List>
                    <Item>D3</Item>
                  </List>
                </Item>
              </List>
            </Item>
          </List>
        </Item>
      </List>,
    )
    expect(result).toBe(
      ['1. D0', '  a. D1', '    i. D2', '      1. D3'].join('\n'),
    )
  })

  it('inherits style from parent list', () => {
    const result = render(
      <List style="numbered">
        <Item>
          Parent
          <List>
            <Item>Child inherits numbered</Item>
          </List>
        </Item>
      </List>,
    )
    expect(result).toBe(
      ['1. Parent', '  1. Child inherits numbered'].join('\n'),
    )
  })
})

describe('Item', () => {
  it('renders content when outside a list', () => {
    const result = render(<Item>orphan</Item>)
    expect(result).toBe('orphan')
  })
})

describe('Raw', () => {
  it('passes text through without processing', () => {
    const result = render(<Raw>{'  indented\n  text  '}</Raw>)
    expect(result).toBe('  indented\n  text  ')
  })

  it('ignores non-string children', () => {
    const result = render(<Raw>{42 as unknown as string}</Raw>)
    expect(result).toBe('')
  })
})
