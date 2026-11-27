const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: 'tests/web',
  timeout: 30000,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'docs/evidencias/web-report', open: 'never' }]],
  outputDir: 'docs/evidencias/web-resultados',
  use: { baseURL: process.env.BASE_URL || 'http://localhost:3000', screenshot: 'on' }
});
