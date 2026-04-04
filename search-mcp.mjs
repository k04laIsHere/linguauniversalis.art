import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Search for OpenClaw MCP integration
console.log('Searching for OpenClaw MCP connection documentation...');
await page.goto('https://www.google.com/search?q=OpenClaw+MCP+server+connection+Model+Context+Protocol');

// Wait a moment for results
await page.waitForTimeout(2000);

// Get page content
const content = await page.content();

// Look for relevant results
const results = await page.$$eval('div.g h3', headers =>
  headers.map(h => h.textContent)
);

console.log('Top search results:');
results.slice(0, 10).forEach((r, i) => {
  console.log(`${i + 1}. ${r}`);
});

await browser.close();
