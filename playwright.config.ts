import { defineConfig } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const DATA_FILE = join(tmpdir(), 'portfolio-e2e', 'messages.json');
export default defineConfig({
  testDir: 'tests/e2e',
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  webServer: {
    command: 'node server/index.js',
    env: { PORT: '4173', DATA_FILE, RATE_LIMIT_MAX: '1000' },
    url: 'http://localhost:4173/api/health',
    reuseExistingServer: false,
  },
});
