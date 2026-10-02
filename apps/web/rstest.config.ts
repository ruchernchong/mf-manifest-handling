import { fileURLToPath } from 'node:url';
import { withRsbuildConfig } from '@rstest/adapter-rsbuild';
import { defineConfig } from '@rstest/core';

// Docs: https://rstest.rs/config/
export default defineConfig({
  extends: withRsbuildConfig({
    // Unit tests exercise components locally; browser checks cover federation.
    modifyRsbuildConfig: (config) => ({ ...config, tools: {} }),
  }),
  testEnvironment: 'happy-dom',
  resolve: {
    alias: {
      'catalog/App': fileURLToPath(
        new URL('../catalog/src/App.tsx', import.meta.url),
      ),
      'analytics/App': fileURLToPath(
        new URL('../analytics/src/App.tsx', import.meta.url),
      ),
    },
  },
  setupFiles: ['./tests/rstest.setup.ts'],
});
