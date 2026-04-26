import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('--- PHASE 1: Landing Page Audit ---');
  await page.goto('http://localhost:5174/');
  
  // Wait for the loader to finish and the main title to appear
  await page.waitForSelector('text=LINGUA UNIVERSALIS', { timeout: 20000 });
  // Wait for animations to settle
  await page.waitForTimeout(3000);

  // Verification 1: Landing Screenshot
  console.log('Capturing Landing Page...');
  await page.screenshot({ path: 'audit_landing_final.png' });

  // Verification 2: Project Declaration Button
  console.log('--- PHASE 2: Project Declaration Visibility ---');
  // Scroll down to find the button under Manifesto text
  await page.evaluate(() => {
    window.scrollTo(0, 500); // Rough scroll to manifesto area
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'audit_declaration_visible.png' });

  // Verification 3: Mobile Menu
  console.log('--- PHASE 3: Mobile Menu Audit ---');
  await page.setViewportSize({ width: 375, height: 812 });
  // Reload to ensure mobile layout is correctly initialized if needed, 
  // but usually responsive design handles it. Let's just resize.
  await page.waitForTimeout(1000);

  // Open the menu
  const menuButton = page.locator('button[aria-label="Menu"]');
  if (await menuButton.isVisible()) {
    await menuButton.click();
    console.log('Mobile menu opened.');
    await page.waitForTimeout(1000);
    
    // Screenshot of Mobile Menu
    await page.screenshot({ path: 'audit_mobile_menu_final.png' });
    
    // Test if 'X' (Close) is clickable
    const closeButton = page.locator('button[aria-label="Close"], button:has(svg)').filter({ visible: true }).first();
    console.log('Testing close button clickability...');
    await closeButton.click();
    await page.waitForTimeout(1000);
    
    const menuIsVisible = await page.locator('nav').isVisible(); // Adjust selector if needed
    console.log('Menu visible after close click:', menuIsVisible);
  } else {
    console.log('ERROR: Menu button not visible at 375x812');
  }

  await browser.close();
  console.log('Forensic audit script completed.');
})();
