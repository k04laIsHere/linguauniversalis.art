import { chromium, devices } from '../projects/linguauniversalis.art/node_modules/playwright/index.mjs';

async function audit() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const url = 'http://localhost:5173/';
  
  const viewports = [
    { name: 'ultrawide', width: 2560, height: 1080 },
    { name: 'standard_desktop', width: 1920, height: 1080 },
    { name: 'laptop', width: 1366, height: 768 },
    { name: 'tablet_portrait', width: 768, height: 1024 }
  ];

  for (const vp of viewports) {
    console.log(`Auditing ${vp.name}...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(url, { waitUntil: 'networkidle' });
    
    try {
      await page.waitForSelector('button', { timeout: 5000 });
      const enter = await page.$('button:has-text("Enter")');
      if (enter) await enter.click();
      await page.waitForTimeout(3000);
    } catch (e) {}

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `audit-${vp.name}.png` });
  }

  await browser.close();
}

audit().catch(console.error);
