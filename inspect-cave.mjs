import { chromium, devices } from '../projects/linguauniversalis.art/node_modules/playwright/index.mjs';
import fs from 'fs';

async function capture() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const url = 'http://localhost:5173/';
  
  // Desktop
  console.log('Capturing Desktop...');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Wait for loader to disappear - we need to click Enter in the loader
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
  } catch (e) {
    console.log('No enter button found or timed out');
  }

  // Navigate to #exitFlight or scroll down
  await page.goto(url + '#exitFlight', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Wait for animations
  await page.screenshot({ path: 'cave-exit-desktop-start.png' });
  
  // Scroll down a bit to see transition
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'cave-exit-desktop-scrolled.png' });

  // Mobile
  console.log('Capturing Mobile...');
  const mobileContext = await browser.newContext({
    ...devices['iPhone 14'],
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(url + '#exitFlight', { waitUntil: 'networkidle' });
  
  // Handle loader for mobile too
  try {
    await mobilePage.waitForSelector('button', { timeout: 5000 });
    const buttons = await mobilePage.$$('button');
    for (const button of buttons) {
        const text = await button.textContent();
        if (text && text.includes('Enter')) {
            await button.click();
            break;
        }
    }
  } catch (e) { }

  await mobilePage.goto(url + '#exitFlight', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: 'cave-exit-mobile-start.png' });
  
  await mobilePage.mouse.wheel(0, 1000);
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: 'cave-exit-mobile-scrolled.png' });

  await browser.close();
}

capture().catch(console.error);
