import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ["allure-vitest/setup"],
    reporters: [
      "default",
      ["allure-vitest/reporter", { resultsDir: "./allure-results" }]
    ],
  },
});