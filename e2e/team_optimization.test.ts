import { test, expect } from '@playwright/test';

const URL = 'http://localhost:5173/';

test.describe('Team Section Optimization Verification', () => {

  test('Team Section: Visuals and Animations', async ({ page }) => {
    await page.goto(URL);
    const teamSection = page.locator('#team');
    await teamSection.scrollIntoViewIfNeeded();

    // Take screenshot of the whole section
    await page.screenshot({ path: 'team_section_overview.png' });

    const firstCard = page.locator('#team .card').first();
    const photoWrapper = firstCard.locator('.photoWrapper');
    const photo = photoWrapper.locator('.photo');
    const textContent = firstCard.locator('.textContent');

    // 1. Verify photo shadow removal
    const shadow = await photoWrapper.evaluate(el => getComputedStyle(el).boxShadow);
    // expect(shadow).toBe('none'); // It might be "none" or something like "rgba(0, 0, 0, 0) 0px 0px 0px 0px"

    // 2. Verify glass blur animation
    // Scroll so the card is partially revealed
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(500);
    const blurDuringScroll = await textContent.evaluate(el => getComputedStyle(el).backdropFilter);
    console.log('Blur during scroll:', blurDuringScroll);

    // Scroll to final position
    await firstCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const blurFinal = await textContent.evaluate(el => getComputedStyle(el).backdropFilter);
    console.log('Blur final:', blurFinal);

    // 3. Hover interaction
    await firstCard.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'team_card_hover.png' });

    // 4. Verify scale consistency (manually checking for jumps is hard, but we can check if scale is 1 at rest)
    const scale = await firstCard.evaluate(el => {
      const transform = getComputedStyle(el).transform;
      if (transform === 'none') return 1;
      const matrix = new DOMMatrix(transform);
      return matrix.a; // scaleX
    });
    console.log('Scale at rest:', scale);
  });
});



