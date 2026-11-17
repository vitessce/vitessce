// @ts-check
const { test, expect } = require('@playwright/test');

// WebGL-heavy page: capturing a stable screenshot on the macOS runner can exceed
// the default 5s expect timeout with Playwright >= 1.61 / Chromium 158.
const SCREENSHOT_OPTIONS = { maxDiffPixelRatio: 0.1, timeout: 30000 };

test('auto-initialization should occur for images and segmentations', async ({ page }) => {
  await page.goto('http://localhost:3000/?dataset=exemplar-small');

  // Expect a page title.
  await expect(page).toHaveTitle("Vitessce");
  await page.waitForLoadState('networkidle');

  // Check the screenshot to determine whether auto-initialization was successful.
  await expect(page).toHaveScreenshot('exemplar-small-auto-init.png', SCREENSHOT_OPTIONS);
});

test('partial initialization is possible for images and segmentations', async ({ page }) => {
  await page.goto('http://localhost:3000/?dataset=exemplar-small-partial-init');

  // Expect a page title.
  await expect(page).toHaveTitle("Vitessce");
  await page.waitForLoadState('networkidle');

  // Check the screenshot to determine whether auto-initialization was successful.
  await expect(page).toHaveScreenshot('exemplar-small-partial-init.png', SCREENSHOT_OPTIONS);
});

