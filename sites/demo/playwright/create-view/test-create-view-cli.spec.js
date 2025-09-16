// @ts-check
const { test, expect } = require('@playwright/test');

test('some-plot new view renders', async ({ page }) => {
  await page.goto('http://localhost:3000/?dataset=some-plot-example');

  // Expect a page title.
  await expect(page).toHaveTitle("Vitessce");

  await expect(page.getByText("TODO: Implement SomePlot view")).toBeVisible();
});
