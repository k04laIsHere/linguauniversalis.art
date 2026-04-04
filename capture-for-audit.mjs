import { chromium, devices } from '../projects/linguauniversalis.art/node_modules/playwright/index.mjs';

async function capture() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const url = 'http://localhost:5173/';
  
  console.log('Capturing Title Screen at 0px...');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(url, { waitUntil: 'networkidle' });
  
  try {
    await page.waitForSelector('button', { timeout: 10000 });
    const buttons = await page.$$('button');
    for (const button of buttons) {
        const text = await button.textContent();
        if (text && text.includes('Enter')) {
            await button.click();
            break;
        }
    }
    await page.waitForTimeout(4000); 
  } catch (e) {
    console.log('Loader button issues');
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'audit-desktop-0px.png' });

  const mobileContext = await browser.newContext({ ...devices['iPhone 14'] });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(url, { waitUntil: 'networkidle' });
  
  try {
    await mobilePage.waitForSelector('button', { timeout: 10000 });
    const buttons = await mobilePage.$$('button');
    for (const button of buttons) {
        const text = await button.textContent();
        if (text && text.includes('Enter')) {
            await button.click();
            break;
        }
    }
    await mobilePage.waitForTimeout(4000);
  } catch (e) { }

  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: 'audit-mobile-0px.png' });

  await browser.close();
}

capture().catch(console.error);
