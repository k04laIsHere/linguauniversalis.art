import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://www.google.com');
await page.screenshot({ path: 'google-screenshot.png', fullPage: false });
await browser.close();

console.log('Screenshot saved to google-screenshot.png');
