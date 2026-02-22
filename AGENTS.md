# Project Guidelines

---

## Package Management with Bun

This project uses **Bun** as the JavaScript package manager. Always use Bun instead of npm, pnpm, or Yarn.

### Core Commands

- **Install dependencies**: `bun install` / `bun add` / `bun remove`
- **Run scripts**: `bun run <script>`

### Key Scripts

- `bun run build` — Build the package (dual ESM/CJS via tsdown)
- `bun run tc` — Type-check without emitting
- `bun run lint` — Run ESLint
- `bun run test` — Run tests with Vitest
- `bun run format` — Check formatting with Prettier
- `bun run format:write` — Auto-fix formatting

## Code Conventions

- Use `type` keyword for type definitions, not `interface`
- Use `import type` for type-only imports
- Do not use TypeScript enums; prefer union literal types
- Prefix unused parameters with `_`
- Follow Prettier formatting (no semicolons, single quotes, trailing commas)
