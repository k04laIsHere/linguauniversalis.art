import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Visiting landing page...');
  await page.goto('http://localhost:5173/');
  
  // Wait for loader to finish. Assuming loader disappears when #root is visible or after some time.
  // We'll wait for the title "LINGUA UNIVERSALIS" to be present.
  await page.waitForSelector('text=LINGUA UNIVERSALIS', { timeout: 15000 });
  
  // Extra wait to ensure transitions are done
  await page.waitForTimeout(2000);

  console.log('Taking landing screenshot...');
  await page.screenshot({ path: 'forensic_landing.png' });

  console.log('Switching to mobile view...');
  await page.setViewportSize({ width: 375, height: 812 });
  
  // Reload or just trigger menu? Usually best to reload in mobile viewport or just trigger.
  // Let's try to find and click the menu button.
  // We'll look for a button that looks like a menu trigger (often has "Menu" text or an icon).
  const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first(); 
  // If that fails, we might need to be more specific. Let's try to find it by attribute if possible.
  
  console.log('Opening mobile menu...');
  // Find the burger button
  const burger = page.locator('button[aria-label="Menu"]');
  await burger.click();
  await page.waitForTimeout(1000);

  // Take screenshot of open menu
  console.log('Taking mobile menu screenshot...');
  await page.screenshot({ path: 'forensic_mobile_menu.png' });

  // Find "Project Declaration" link in the menu
  // Based on code, it should be in the sidebarNav as .sidebarDeclarationLinkMobile
  const declarationLink = page.locator('button:has-text("Project Declaration"), button:has-text("Декларация проекта"), button:has-text("Declaración del Proyecto")').filter({ visible: true });
  const isVisible = await declarationLink.isVisible();
  console.log('Project Declaration link visible:', isVisible);
  
  if (isVisible) {
      // Optional: highlight it or just ensure it's in the screenshot
      await declarationLink.evaluate(el => el.style.border = '2px solid red');
      await page.screenshot({ path: 'forensic_mobile_menu_highlight.png' });
  }

  await browser.close();
  console.log('Audit screenshots captured.');
})();
