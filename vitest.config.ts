import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.spec.ts'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
});
