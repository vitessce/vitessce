// @ts-check
const { test, expect } = require('@playwright/test');

test('higlass demo renders with React 19', async ({ page }) => {
  await page.goto('http://localhost:3000/?dataset=just-higlass');
  await expect(page).toHaveTitle('Vitessce');
  // Wait for the Vitessce container to mount (dataset pages don't have the welcome heading).
  await expect(page.locator('.vitessce-container')).toBeVisible({ timeout: 30000 });

  // The just-higlass dataset should render exactly two HiGlass views.
  const higlassHeadings = page.getByRole('heading', { name: 'HiGlass', exact: true });
  await expect(higlassHeadings).toHaveCount(2);

  const higlassInnerDivs = page.locator('.higlass .tiled-plot-div');
  await expect(higlassInnerDivs).toHaveCount(2, { timeout: 10000 });
});
