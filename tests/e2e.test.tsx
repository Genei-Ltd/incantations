import { describe, expect, it } from 'vitest'
import {
  render,
  List,
  Item,
  When,
  Raw,
  useProvider,
  useModel,
} from '../src/index'
import type { PropsWithChildren } from '../src/index'

// ---- Reusable library components ----

function OutputFormat() {
  const provider = useProvider()
  return (
    <When provider={['openai', 'google']}>
      {provider === 'openai'
        ? 'Format your response using markdown with clear headers and bullet points.'
        : 'Format your response clearly with structured sections.'}
    </When>
  )
}

function SafetyRules({ rules }: { rules: string[] }) {
  return (
    <safety>
      <List style="numbered">
        {rules.map((rule, i) => (
          <Item key={i}>{rule}</Item>
        ))}
      </List>
    </safety>
  )
}

function FewShotExamples({
  examples,
}: {
  examples: { input: string; output: string }[]
}) {
  return (
    <examples>
      {examples.map((ex, i) => (
        <example key={i}>
          <user-message>
            <Raw>{ex.input}</Raw>
          </user-message>
          <assistant-message>
            <Raw>{ex.output}</Raw>
          </assistant-message>
        </example>
      ))}
    </examples>
  )
}

function ContextSection({
  children,
  source,
  date,
}: PropsWithChildren<{ source: string; date?: string }>) {
  return (
    <context source={source} date={date}>
      {children}
    </context>
  )
}

function ModelHint() {
  const model = useModel()
  if (model == null) return null

  return (
    <metadata>
      <Raw>{`target_model: ${model}`}</Raw>
    </metadata>
  )
}

// ---- The actual prompt ----

function CodingAssistantPrompt({
  language,
  codeContext,
  retrievedDocs,
}: {
  language: string
  codeContext: string
  retrievedDocs: string
}) {
  return (
    <>
      <system>
        {`
          You are an expert ${language} coding assistant.
          You help developers write clean, idiomatic code.
        `}

        <OutputFormat />

        <When provider="anthropic">
          {`
            Use XML tags like <code>, <explanation>, and <suggestion>
            to structure your responses.
          `}
        </When>

        <SafetyRules
          rules={[
            'Never generate code that could be used for malicious purposes.',
            'Always consider security best practices.',
            'If unsure, say so rather than guessing.',
          ]}
        />

        <FewShotExamples
          examples={[
            {
              input: 'How do I read a file?',
              output: `Use the fs module:\n\nimport fs from 'fs'\nconst data = fs.readFileSync('path', 'utf-8')`,
            },
          ]}
        />
      </system>

      <ContextSection source="repository" date="2026-02-22">
        <Raw>{codeContext}</Raw>
      </ContextSection>

      <ContextSection source="documentation">
        <Raw>{retrievedDocs}</Raw>
      </ContextSection>

      <ModelHint />
    </>
  )
}

// ---- Tests ----

describe('end-to-end prompt rendering', () => {
  const props = {
    language: 'TypeScript',
    codeContext:
      'function greet(name: string) {\n  return `Hello, ${name}!`\n}',
    retrievedDocs: 'TypeScript 5.9 supports the satisfies operator...',
  }

  it('renders for Claude (XML)', () => {
    const result = render(<CodingAssistantPrompt {...props} />, {
      model: 'claude-sonnet-4-20250514',
    })
    expect(result).toMatchSnapshot()
  })

  it('renders for GPT-4o (Markdown)', () => {
    const result = render(<CodingAssistantPrompt {...props} />, {
      model: 'gpt-4o',
    })
    expect(result).toMatchSnapshot()
  })

  it('renders for Gemini (Markdown, google provider)', () => {
    const result = render(<CodingAssistantPrompt {...props} />, {
      model: 'gemini-1.5-flash',
    })
    expect(result).toMatchSnapshot()
  })
})
