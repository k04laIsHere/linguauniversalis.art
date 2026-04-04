import { chromium, devices } from '../projects/linguauniversalis.art/node_modules/playwright/index.mjs';

async function capture() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const url = 'http://localhost:5173/';
  
  console.log('Capturing Desktop at 0px...');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Enter the site
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
    // Wait for loader fade and Cave animation
    await page.waitForTimeout(3000); 
  } catch (e) {
    console.log('Loader button issues');
  }

  // FORCE SCROLL TO TOP to ensure we are at 0px
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'cave-start-desktop.png' });

  // Mobile
  console.log('Capturing Mobile at 0px...');
  const mobileContext = await browser.newContext({
    ...devices['iPhone 14'],
  });
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
    await mobilePage.waitForTimeout(3000);
  } catch (e) { }

  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: 'cave-start-mobile.png' });

  await browser.close();
}

capture().catch(console.error);
