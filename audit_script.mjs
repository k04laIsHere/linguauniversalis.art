import { chromium } from 'playwright';

async function audit() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('--- FINAL ATTEMPT ---');
  await page.goto('http://127.0.0.1:5174/');
  await page.waitForTimeout(3000);
  
  // Click localized RU journey button to enter Gallery
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const target = btns.find(b => b.innerText.includes('НАЧАТЬ ПУТЕШЕСТВИЕ') || b.innerText.includes('START THE JOURNEY'));
    if (target) target.click();
  });
  
  await page.waitForTimeout(5000);

  const results = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    if (!aside) return 'STILL NO SIDEBAR';
    
    const divs = [...document.querySelectorAll('div')];
    const portalFrame = divs.find(d => window.getComputedStyle(d).border.includes('rgba(0, 0, 0, 0.08)'));
    const goldText = [...document.querySelectorAll('*')].find(el => window.getComputedStyle(el).color === 'rgb(212, 175, 55)');
    const title = document.querySelector('h1');
    const intro = document.querySelector('p');
    const portalBtn = document.querySelector('button[aria-label*="Enter"]');
    const navBtns = [...aside.querySelectorAll('button')];
    
    return {
        aside: !!aside,
        portal: portalFrame ? {
            found: true,
            wrapsIntro: portalFrame.contains(intro),
            wrapsBtn: portalFrame.contains(portalBtn)
        } : 'NOT FOUND',
        gold: goldText ? {
            text: goldText.innerText,
            style: window.getComputedStyle(goldText).color
        } : 'NOT FOUND',
        spacing: (title && goldText) ? (goldText.getBoundingClientRect().top - title.getBoundingClientRect().bottom) : 'N/A',
        nav: navBtns.map(b => b.innerText)
    };
  });

  console.log('FINAL RESULTS:', JSON.stringify(results, null, 2));
  await browser.close();
}
audit();
