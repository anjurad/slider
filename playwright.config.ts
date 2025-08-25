import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  reporter: 'list',
  use: {
    actionTimeout: 10_000,
  trace: 'on-first-retry',
  // keep videos and screenshots for failures to aid CI debugging
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
