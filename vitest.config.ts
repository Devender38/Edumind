import { defineConfig } from 'vitest/config';

// ResolveX Test Configuration
// All test files share a single SQLite database (dev.db).
// Phase 18 tests perform full DB wipes in beforeEach to maintain isolation.
// fileParallelism: false ensures sequential file execution across all invocation paths
// (both `npm test` and `npx vitest run` directly).
export default defineConfig({
  test: {
    // CRITICAL: Must run test files sequentially — they share one SQLite DB.
    // Phase 18 and other test files do destructive cleanup that would corrupt
    // concurrent test runs if fileParallelism were enabled.
    fileParallelism: false,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Increase timeout for integration tests that spin up HTTP servers
    testTimeout: 60000,
  },
});
