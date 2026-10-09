import {defineConfig,devices} from '@playwright/test';
process.env.FOLIOCOVE_PAGES_TEST='1';
export default defineConfig({
 testDir:'./tests/e2e',testMatch:['pages.spec.mjs','guide-examples.spec.mjs','file-order.spec.mjs','results.spec.mjs'],timeout:90000,
 use:{baseURL:'http://127.0.0.1:4174',acceptDownloads:true},
 webServer:{command:'node scripts/dev-server.mjs',url:'http://127.0.0.1:4174/FolioCove/',reuseExistingServer:false,env:{PORT:'4174',FOLIOCOVE_BASE_PATH:'/FolioCove'}},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}]
});
