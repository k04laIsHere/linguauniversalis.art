import { chromium } from '../projects/linguauniversalis.art/node_modules/playwright/index.mjs';

(async () => {
  const browser = await chromium.launch();
  // Mobile device simulation
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  console.log('Navigating to gallery...');
  await page.goto('http://localhost:5173/#gallery', { waitUntil: 'networkidle' });

  // Wait for loader to disappear
  console.log('Waiting for loader...');
  await page.waitForFunction(() => !document.querySelector('.loader-container'), { timeout: 10000 }).catch(() => console.log('Loader not found or already gone'));
  await page.waitForTimeout(3000); // Extra buffer for GSAP init

  // Screenshot 1: Top of gallery
  await page.screenshot({ path: 'gallery-mobile-1.png' });
  console.log('Captured screenshot 1');

  // Screenshot 2: Middle (scroll down)
  await page.evaluate(() => window.scrollTo(0, 2000));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'gallery-mobile-2.png' });
  console.log('Captured screenshot 2');

  // Screenshot 3: Further down
  await page.evaluate(() => window.scrollTo(0, 5000));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'gallery-mobile-3.png' });
  console.log('Captured screenshot 3');

  await browser.close();
})();
