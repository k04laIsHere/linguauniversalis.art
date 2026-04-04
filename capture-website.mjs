import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to your local dev server
  await page.goto('http://localhost:5173/#cave', { waitUntil: 'networkidle' });

  // Wait for any animations
  await page.waitForTimeout(2000);

  // Take full page screenshot
  await page.screenshot({ path: 'website-capture.png', fullPage: true });

  // Get page content
  const content = await page.content();

  console.log('✅ Screenshot saved to website-capture.png');
  console.log('Page URL:', page.url());

  // Check if Fork section exists
  const forkExists = await page.locator('#forkSection').count();
  console.log('ForkSection elements found:', forkExists);

  await browser.close();
})();
