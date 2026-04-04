import { chromium } from '../projects/linguauniversalis.art/node_modules/playwright/index.mjs';

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/andrew/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome'
  });
  const page = await browser.newPage();
  
  // High contrast audit to find the breach content
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(3000); 

  // Debug: find coordinates of the breach
  const breachDetails = await page.evaluate(() => {
    const el = document.querySelector('[class*="archiveBreach"]');
    if (!el) return 'NOT FOUND';
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const content = el.innerText;
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      opacity: style.opacity,
      zIndex: style.zIndex,
      content: content,
      innerHtml: el.innerHTML.length
    };
  });
  
  console.log('Breach Audit:', JSON.stringify(breachDetails, null, 2));
  await page.screenshot({ path: 'audit-mobile-debug.png' });

  await browser.close();
})();
