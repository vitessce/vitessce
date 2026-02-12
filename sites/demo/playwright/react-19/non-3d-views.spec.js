// @ts-check
const { test, expect } = require('@playwright/test');

test('demo homepage renders with React 19', async ({ page }) => {
  await page.goto('http://localhost:3000/?show=all');
  await expect(page).toHaveTitle('Vitessce');
  await expect(page.getByRole('heading', { name: 'Vitessce', exact: true })).toBeVisible();
});

test('non-3D spatialBeta config renders with React 19', async ({ page }) => {
  await page.goto('http://localhost:3000/?dataset=exemplar-small');
  await expect(page).toHaveTitle('Vitessce');
  // Wait for the Vitessce component to mount (the grid layout renders view titles)
  await expect(page.locator('.vitessce-container')).toBeVisible({ timeout: 30000 });
});
