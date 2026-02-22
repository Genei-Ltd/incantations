import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@coloop-ai/incantations/jsx-runtime': path.resolve(
        __dirname,
        'src/jsx-runtime.ts',
      ),
      '@coloop-ai/incantations/jsx-dev-runtime': path.resolve(
        __dirname,
        'src/jsx-dev-runtime.ts',
      ),
      '@coloop-ai/incantations': path.resolve(__dirname, 'src/index.ts'),
    },
  },
})
