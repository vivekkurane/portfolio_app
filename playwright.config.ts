import { defineConfig } from '@playwright/test';

export const DATA_FILE = '/tmp/portfolio-e2e/messages.json';
export default defineConfig({
  testDir: 'tests/e2e',
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  webServer: {
    command: `PORT=4173 DATA_FILE=${DATA_FILE} RATE_LIMIT_MAX=1000 node server/index.js`,
    url: 'http://localhost:4173/api/health',
    reuseExistingServer: false,
  },
});
