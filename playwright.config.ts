import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for PIC-Mobile.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI 
    ? [['dot'], ['html', { open: 'never' }]] 
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Desktop Chrome',
      use: { 
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: 'node ./node_modules/vite/bin/vite.js --port=3002 --host=0.0.0.0',
    url: 'http://localhost:3002',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
