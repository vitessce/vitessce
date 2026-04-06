// @ts-check
const { test, expect } = require('@playwright/test');

test('higlass demo renders with React 19', async ({ page }) => {
  await page.goto('http://localhost:3000/?dataset=just-higlass');
  await expect(page).toHaveTitle('Vitessce');
  // Wait for the Vitessce container to mount (dataset pages don't have the welcome heading).
  await expect(page.locator('.vitessce-container')).toBeVisible({ timeout: 30000 });

  await expect(page.getByRole('heading', { name: 'HiGlass', exact: true }).first()).toBeVisible();

  const higlassInnerDiv = page.locator('.higlass .tiled-plot-div');
  await expect(higlassInnerDiv).toBeVisible({ timeout: 10000 });
});
