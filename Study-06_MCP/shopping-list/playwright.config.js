// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testMatch: '**/*.test.js',
  use: {
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
  },
  reporter: [
    ['list'],
  ],
});
