import { defineConfig } from "vitest/config";
import { resolve } from "path";

/**
 * Vitest configuration.
 *
 * Adds @/ path-alias resolution matching tsconfig.json paths.
 * This is additive — it does not change vitest defaults except enabling
 * `@/` imports in test files (previously tests had to use relative imports).
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    // Exclude Playwright spec files and e2e dirs (they use @playwright/test)
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/*.spec.ts",
      "tests/e2e/**",
    ],
  },
});
