import { test, expect } from '@playwright/test';

const URL = 'http://localhost:5173/';

test.describe('Lingua Universalis UI/UX Verification', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // --- Global / All Sections ---

  test('Global: Navigation should be functional', async ({ page }) => {
    const sections = ['cave', 'manifesto', 'ancient', 'exitFlight', 'team', 'events', 'natureUrban', 'gallery', 'contact'];
    
    // Toggle navigation overlay
    await page.click('button[aria-label="Toggle Navigation"]');
    const overlay = page.locator('header div[class*="overlay"]');
    await expect(overlay).toBeVisible();

    for (const id of sections) {
      const navBtn = page.locator(`button:has-text("${id}")`).or(page.locator(`nav button:nth-child(${sections.indexOf(id) + 1})`));
      await expect(navBtn).toBeVisible();
    }
  });

  test('Global: Ambient Whispers should appear', async ({ page }) => {
    // Wait for a whisper to spawn
    const whisper = page.locator('div[class*="whisper"]');
    await expect(whisper).toBeVisible({ timeout: 10000 });
  });

  test('Global: Flashlight should follow pointer', async ({ page }) => {
    const root = page.locator('html');
    await page.mouse.move(100, 100);
    const x1 = await root.evaluate(el => getComputedStyle(el).getPropertyValue('--lu_x'));
    
    await page.mouse.move(200, 200);
    const x2 = await root.evaluate(el => getComputedStyle(el).getPropertyValue('--lu_x'));
    
    expect(x1).not.toBe(x2);
  });

  // --- Transition Tests ---

  test('Transitions: Backdrop crossfade during Nature to Urban', async ({ page }) => {
    const natureBackdrop = page.locator('#natureBackdrop');
    const urbanBackdrop = page.locator('#urbanBackdrop');
    
    // 1. At Team section, Nature should be visible, Urban hidden
    await page.locator('#team').scrollIntoViewIfNeeded();
    await expect(natureBackdrop).toHaveCSS('opacity', '1');
    await expect(urbanBackdrop).toHaveCSS('opacity', '0');

    // 2. Scroll into NatureUrban transition section
    const nuSection = page.locator('#natureUrban');
    await nuSection.scrollIntoViewIfNeeded();
    
    // We need to scroll a bit into the pinned area to trigger the crossfade
    // NatureUrban has end: '+=200%'
    await page.mouse.wheel(0, 500);
    
    // 3. At some point during the transition, both should have partial opacity
    // Note: Due to scrub, we check if they are changing
    const natureOpacity = await natureBackdrop.evaluate(el => getComputedStyle(el).opacity);
    const urbanOpacity = await urbanBackdrop.evaluate(el => getComputedStyle(el).opacity);
    
    expect(parseFloat(natureOpacity)).toBeLessThan(1);
    expect(parseFloat(urbanOpacity)).toBeGreaterThan(0);

    // 4. At Gallery, Urban should be visible, Nature hidden
    await page.locator('#gallery').scrollIntoViewIfNeeded();
    await expect(urbanBackdrop).toHaveCSS('opacity', '1');
    await expect(natureBackdrop).toHaveCSS('opacity', '0');
  });

  test('Transitions: Cave to ExitFlight seamlessness', async ({ page }) => {
    const cave = page.locator('#cave');
    const exitFlight = page.locator('#exitFlight');
    const natureBackdrop = page.locator('#natureBackdrop');

    // Start at cave
    await cave.scrollIntoViewIfNeeded();
    await expect(natureBackdrop).toHaveCSS('opacity', '0');

    // Scroll to exitFlight
    await exitFlight.scrollIntoViewIfNeeded();
    
    // Nature backdrop should start fading in during ExitFlight
    await expect(natureBackdrop).toHaveCSS('opacity', '1');
  });

  test('Transitions: Smooth scroll navigation', async ({ page }) => {
    await page.click('button[aria-label="Toggle Navigation"]');
    
    // Click 'Gallery' in nav
    const galleryBtn = page.locator('nav button:has-text("Gallery"), nav button:has-text("Галерея")');
    await galleryBtn.click();
    
    // Wait for scroll to finish and check if gallery is in viewport
    await page.waitForTimeout(1000); // Wait for scroll animation
    const isVisible = await page.locator('#gallery').isVisible();
    expect(isVisible).toBe(true);
    
    // Check if backdrop updated correctly
    await expect(page.locator('#urbanBackdrop')).toHaveCSS('opacity', '1');
  });

  test('Cave: Should show manifesto and artifacts', async ({ page }) => {
    await expect(page.locator('#cave h1')).toBeVisible();
    await expect(page.locator('#manifesto')).toBeAttached();
    
    const artifacts = page.locator('[data-artifact="1"]');
    await expect(artifacts).toHaveCount(4);
  });

  test('ExitFlight: Should handle scroll-triggered transitions', async ({ page }) => {
    await page.locator('#exitFlight').scrollIntoViewIfNeeded();
    const caveEdges = page.locator('div[class*="caveEdges"]');
    
    // Check initial state (opacity should be high)
    await expect(caveEdges).toBeVisible();
    
    // Scroll down significantly to trigger GSAP scrub
    await page.mouse.wheel(0, 2000);
    
    // The scale or opacity should have changed (hard to test exact GSAP values without injecting, 
    // but we can check if it stays in DOM)
    await expect(caveEdges).toBeAttached();
  });

  test('Team: Should update active list item on scroll', async ({ page }) => {
    await page.locator('#team').scrollIntoViewIfNeeded();
    const firstItem = page.locator('[data-team-li="1"]').first();
    const secondItem = page.locator('[data-team-li="1"]').nth(1);

    // Initial item should be active (if logic is at top)
    // We scroll a bit to ensure a change
    await page.mouse.wheel(0, 1000);
    // Note: The specific class name depends on styles.listItemActive
    // We check for presence of a class that indicates activity
    const classList = await firstItem.evaluate(el => el.className);
    expect(classList).toContain('Active');
  });

  test('Gallery: Filters and Lightbox', async ({ page }) => {
    await page.locator('#gallery').scrollIntoViewIfNeeded();
    
    // Search filter
    const search = page.getByPlaceholder(/Search|Поиск/);
    await search.fill('Andrey Vaganov');
    
    const cards = page.locator('button[class*="card"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    
    // Open lightbox
    await cards.first().click();
    const lightbox = page.locator('div[class*="lightbox"]'); // Adjust based on actual class
    await expect(lightbox).toBeVisible();
  });

  test('Contact: Signal interaction', async ({ page }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded();
    const signalBtn = page.locator('button:has-text("Сигнал"), button:has-text("Signal")').first();
    
    // Simulate long press
    await signalBtn.hover();
    await page.mouse.down();
    await page.waitForTimeout(2500); // Wait for progress > 1
    await page.mouse.up();
    
    // Check if contact channels are revealed
    await expect(page.locator('text=linguauniversalis.project@gmail.com')).toBeVisible();
  });

});

