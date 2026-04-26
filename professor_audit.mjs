import { chromium } from 'playwright';
import fs from 'fs';

async function audit() {
  const browser = await chromium.launch();
  
  // 1. Landing Screen Audit (Desktop)
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000); // Wait for animations/transitions
  
  // Screenshot 1: Landing (Archive Mode)
  await page.screenshot({ path: 'professor_landing.png' });
  console.log('Landing screenshot saved.');

  // 2. Mobile Menu Audit
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5174');
  await mobilePage.waitForTimeout(2000);

  // Click menu button - using class based on Header.module.css
  const burger = mobilePage.locator('button[class*="menuToggle"]');
  await burger.waitFor({ state: 'visible' });
  await burger.click();
  await mobilePage.waitForTimeout(1000);

  // Screenshot 2: Mobile Menu
  await mobilePage.screenshot({ path: 'professor_mobile_menu.png' });
  console.log('Mobile menu screenshot saved.');

  await browser.close();
}

audit().catch(err => {
  console.error(err);
  process.exit(1);
});
