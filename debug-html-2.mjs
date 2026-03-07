import { chromium } from './node_modules/playwright/index.mjs';

async function checkBreach() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  await page.goto('http://localhost:3000/', { waitUntil: 'load' });
  await page.waitForTimeout(10000); // 10s

  const html = await page.content();
  console.log('HTML Length:', html.length);
  console.log('Body:', await page.innerHTML('body'));

  await browser.close();
}

checkBreach().catch(console.error);
