import { chromium } from './node_modules/playwright/index.mjs';

async function audit() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const url = 'http://localhost:3000/';
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const html = await page.content();
  console.log("HTML Length:", html.length);
  console.log("Body:", await page.innerHTML('body'));
  
  await browser.close();
}

audit().catch(console.error);
