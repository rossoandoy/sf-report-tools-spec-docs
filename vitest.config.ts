import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@sf-report-tools/types': path.resolve(__dirname, 'shared/types/src/index.ts'),
      '@sf-report-tools/utils': path.resolve(__dirname, 'shared/utils/src/index.ts'),
      '@sf-report-tools/hooks': path.resolve(__dirname, 'shared/hooks/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['**/node_modules/**', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
    },
  },
});
