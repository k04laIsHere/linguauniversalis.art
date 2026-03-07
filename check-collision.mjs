import { chromium } from './node_modules/playwright/index.mjs';

async function audit() {
  const browser = await chromium.launch();
  const results = [];
  
  const viewports = [
    { name: 'desktop-wide', width: 1920, height: 1080 },
    { name: 'desktop-square', width: 1200, height: 1200 },
    { name: 'tablet-portrait', width: 768, height: 1024 },
    { name: 'mobile-tall', width: 375, height: 812 },
    { name: 'mobile-small', width: 320, height: 568 }
  ];

  const url = 'http://localhost:3000/';

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const check = await page.evaluate(() => {
      const title = document.querySelector('h1');
      const breach = document.querySelector('[class*="archiveBreach"]');
      const breachContent = document.querySelector('[class*="breachContent"]');
      
      if (!title || !breach || !breachContent) return { error: 'Missing elements' };

      const tRect = title.getBoundingClientRect();
      const bRect = breach.getBoundingClientRect();
      const cRect = breachContent.getBoundingClientRect();

      // Check occlusion: Is the breach rectangle overlapping the title rectangle?
      const isOccluded = !(bRect.right < tRect.left || 
                           bRect.left > tRect.right || 
                           bRect.bottom < tRect.top || 
                           bRect.top > tRect.bottom);

      // Check fit: Is breachContent fully inside the breach visual?
      // Note: archiveBreach is the container, breachContent is the text
      const fits = cRect.top >= bRect.top &&
                   cRect.bottom <= bRect.bottom &&
                   cRect.left >= bRect.left &&
                   cRect.right <= bRect.right;

      return { isOccluded, fits, tRect, bRect, cRect };
    });

    results.push({ name: vp.name, check });
    await context.close();
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

audit().catch(console.error);
