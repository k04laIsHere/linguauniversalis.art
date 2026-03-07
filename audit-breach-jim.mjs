import { chromium, devices } from './node_modules/playwright/index.mjs';

async function audit() {
  const browser = await chromium.launch();
  
  const viewports = [
    { name: 'desktop-wide', width: 1920, height: 1080 },
    { name: 'desktop-square', width: 1200, height: 1200 },
    { name: 'tablet-portrait', width: 768, height: 1024 },
    { name: 'mobile-tall', width: 375, height: 812 },
    { name: 'mobile-small', width: 320, height: 568 }
  ];

  const url = 'http://localhost:3000/';

  for (const vp of viewports) {
    console.log(`Auditing ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2
    });
    const page = await context.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for animation
    await page.waitForTimeout(4000);
    
    await page.screenshot({ path: `audit-breach-${vp.name}.png`, fullPage: false });
    await context.close();
  }

  await browser.close();
}

audit().catch(console.error);
