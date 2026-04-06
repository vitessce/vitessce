// @ts-check
const { test, expect } = require('@playwright/test');

test('higlass demo renders with React 19', async ({ page }) => {
  await page.goto('http://localhost:3000/?dataset=just-higlass');
  await expect(page).toHaveTitle('Vitessce');
  await expect(page.getByRole('heading', { name: 'Vitessce', exact: true })).toBeVisible();

  await expect(page.getByRole('heading', { name: 'HiGlass', exact: true })).toBeVisible();

  const higlassInnerDiv = page.locator('.higlass .tiled-plot-div');
  await expect(higlassInnerDiv).toBeVisible({ timeout: 10000 });
});
