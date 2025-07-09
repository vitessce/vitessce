// @ts-check
const { test, expect } = require('@playwright/test');

test('auto-initialization should occur for images and segmentations', async ({ page }) => {
  await page.goto('http://localhost:3000/?dataset=exemplar-small');

  // Expect a page title.
  await expect(page).toHaveTitle("Vitessce");

  // Check the screenshot to determine whether auto-initialization was successful.
  await expect(page).toHaveScreenshot('exemplar-small-auto-init.png', { maxDiffPixelRatio: 0.1 });
});

test('partial initialization is possible for images and segmentations', async ({ page }) => {
  await page.goto('http://localhost:3000/?dataset=exemplar-small-partial-init');

  // Expect a page title.
  await expect(page).toHaveTitle("Vitessce");

  // Check the screenshot to determine whether auto-initialization was successful.
  await expect(page).toHaveScreenshot('exemplar-small-partial-init.png', { maxDiffPixelRatio: 0.1 });
});

