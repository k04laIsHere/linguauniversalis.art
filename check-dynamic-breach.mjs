import { chromium } from './node_modules/playwright/index.mjs';

async function audit() {
  const browser = await chromium.launch();
  const results = [];
  
  const viewports = [
    { name: 'desktop-wide', width: 1920, height: 1080 },
    { name: 'desktop-16-10', width: 1920, height: 1200 }, // Specific 16:10 test
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
      const breach = document.querySelector('[class*="_archiveBreach_"]');
      const breachContent = document.querySelector('[class*="_breachContent_"]');
      const headerInner = document.querySelector('[class*="_headerInner_"]');
      
      if (!title || !breach || !breachContent) return { error: 'Missing elements' };

      const tRect = title.getBoundingClientRect();
      const bRect = breach.getBoundingClientRect();
      const cRect = breachContent.getBoundingClientRect();
      const hRect = headerInner ? headerInner.getBoundingClientRect() : null;

      // Check fit: Is breachContent fully inside the breach visual?
      const fits = cRect.top >= bRect.top &&
                   cRect.bottom <= bRect.bottom &&
                   cRect.left >= bRect.left &&
                   cRect.right <= bRect.right;

      return { 
        fits, 
        bRect: { width: bRect.width, height: bRect.height }, 
        cRect: { width: cRect.width, height: cRect.height },
        hRect: hRect ? { width: hRect.width } : null,
        windowWidth: window.innerWidth
      };
    });

    results.push({ name: vp.name, check });
    await context.close();
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

audit().catch(console.error);
