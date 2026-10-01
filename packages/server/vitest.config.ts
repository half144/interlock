import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@server": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // Fake-timer suites freeze p-throttle's clock, so a real per-second cap deadlocks them.
    env: {
      INTERLOCK_GIT_MAX_PROCESSES_PER_SECOND: "10000",
    },
    testTimeout: 30000,
    hookTimeout: 60000,
    globals: true,
    environment: "node",
    setupFiles: [path.resolve(__dirname, "./src/test-utils/vitest-setup.ts")],
    pool: "forks",
    fileParallelism: false,
    // At the default worker count, subprocess-heavy Git tests starve and native fs-event tests lag past
    // their deadlines (Windows first, then a loaded Mac running the pre-push gate).
    maxWorkers: process.platform === "win32" ? 2 : 4,
    exclude: ["**/node_modules/**", "**/dist/**", "**/.claude/**", "**/.dev/**"],
  },
});
