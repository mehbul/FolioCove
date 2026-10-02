import { defineConfig } from '@playwright/test';
import base from './playwright.config.mjs';

export default defineConfig({
  ...base,
  outputDir: 'test-results/mobile',
  testMatch: '**/routes.spec.mjs',
  projects: [
    { name: 'mobile-small', use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
    { name: 'mobile-large', use: { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true } }
  ]
});
