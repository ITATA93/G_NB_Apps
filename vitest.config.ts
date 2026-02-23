import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts'],
    exclude: ['node_modules', 'MIRA', 'Apps/UGCO/scripts-archive'],
    coverage: {
      provider: 'v8',
      include: ['shared/scripts/**/*.ts'],
      exclude: ['**/__tests__/**', '**/node_modules/**'],
    },
  },
});
