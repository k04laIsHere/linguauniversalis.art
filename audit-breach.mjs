import { chromium } from '../projects/linguauniversalis.art/node_modules/playwright/index.mjs';

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/andrew/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome'
  });
  const page = await browser.newPage();
  
  // Desktop Audit
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(4000); 
  await page.screenshot({ path: 'audit-desktop-1920.png' });

  // Ultrawide Audit
  await page.setViewportSize({ width: 3440, height: 1440 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'audit-ultrawide.png' });

  // Laptop Audit
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'audit-laptop.png' });

  // Mobile Audit
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'audit-mobile-final.png' });

  await browser.close();
})();
