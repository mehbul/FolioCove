import {defineConfig,devices} from '@playwright/test';
import base from './playwright.config.mjs';
const webkitLaunch=process.env.FOLIOCOVE_WEBKIT_EXECUTABLE?{executablePath:process.env.FOLIOCOVE_WEBKIT_EXECUTABLE}:{};
export default defineConfig({
 ...base,outputDir:'test-results/pilot',workers:2,
 testMatch:['**/pilot.spec.mjs','**/core-workflows.spec.mjs','**/extended.spec.mjs'],
 grep:/camera scanner converts|merge and split produce|edit and typed sign add|unavailable local AI|pilot:/,
 projects:[
  {name:'android-emulation',use:{...devices['Pixel 7'],browserName:'chromium'}},
  {name:'iphone-webkit-emulation',use:{...devices['iPhone 13'],browserName:'webkit',launchOptions:webkitLaunch}},
  {name:'desktop-webkit',use:{...devices['Desktop Safari'],browserName:'webkit',launchOptions:webkitLaunch}}
 ]
});
