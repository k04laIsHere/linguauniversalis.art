import { chromium, devices } from '../projects/linguauniversalis.art/node_modules/playwright/index.mjs';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to gallery mode...');
  await page.goto('http://localhost:5173/#gallery', { waitUntil: 'networkidle' });

  // Wait for loader to disappear
  console.log('Waiting for loader...');
  await page.waitForFunction(() => !document.querySelector('.loader-overlay'));
  await page.waitForTimeout(2000); // Buffer for GSAP init

  // Screenshot 1: Start of Gallery
  await page.screenshot({ path: 'gallery_mobile_1.png' });
  console.log('✅ Screenshot 1 saved');

  // Screenshot 2: Middle of Gallery (Scroll down)
  console.log('Scrolling to middle...');
  await page.evaluate(() => {
    window.scrollTo(0, window.innerHeight * 5);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'gallery_mobile_2.png' });
  console.log('✅ Screenshot 2 saved');

  // Screenshot 3: Further down
  console.log('Scrolling further...');
  await page.evaluate(() => {
    window.scrollTo(0, window.innerHeight * 15);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'gallery_mobile_3.png' });
  console.log('✅ Screenshot 3 saved');

  await browser.close();
})();
