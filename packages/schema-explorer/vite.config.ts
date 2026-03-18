import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/schema-explorer/',
  resolve: {
    alias: {
      '@sf-report-tools/types': path.resolve(__dirname, '../../shared/types/src/index.ts'),
      '@sf-report-tools/utils': path.resolve(__dirname, '../../shared/utils/src/index.ts'),
      '@sf-report-tools/hooks': path.resolve(__dirname, '../../shared/hooks/src/index.ts'),
    },
  },
});
