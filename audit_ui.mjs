import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport for desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  
  try {
    console.log('Navigating to http://localhost:5174#archive...');
    await page.goto('http://localhost:5174#archive', { waitUntil: 'networkidle' });
    
    // Screenshot 1: Desktop Manifesto & Buttons
    await page.screenshot({ path: 'audit_archive_desktop.png' });
    console.log('Desktop screenshot saved.');

    // Screenshot 2: Click Declaration Button (On-page)
    const declBtn = page.locator('button:has-text("Project Declaration"), button:has-text("Декларация проекта"), button:has-text("Declaración del proyecto")').first();
    if (await declBtn.isVisible()) {
        await declBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'audit_declaration_modal.png' });
        console.log('Modal screenshot saved.');
        await page.keyboard.press('Escape');
    }

    // Screenshot 3: Mobile Menu & Close Button
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5174#archive', { waitUntil: 'networkidle' });
    
    // Click burger
    const burger = page.locator('header button[class*="burger"]');
    await burger.click({ force: true });
    await page.waitForTimeout(1000); // Wait for transition
    await page.screenshot({ path: 'audit_mobile_menu_open.png' });
    console.log('Mobile menu screenshot saved.');

  } catch (e) {
    console.error('Audit failed:', e);
  } finally {
    await browser.close();
  }
})();
