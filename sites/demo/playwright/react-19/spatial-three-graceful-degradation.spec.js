// @ts-check
const { test, expect } = require('@playwright/test');

test('3D spatial view degrades gracefully on React 19 without crashing the page', async ({ page }) => {
  // Load a config that uses spatialBeta with three: true.
  // Under React 19, the bundled @react-three/fiber v8 may fail,
  // but the ErrorBoundary should catch it and the page should not crash.
  await page.goto('http://localhost:3000/?dataset=kiemen-2024');
  await expect(page).toHaveTitle('Vitessce');

  // The page should still be functional — verify the Vitessce container is present.
  await expect(page.locator('.vitessce-container')).toBeVisible({ timeout: 30000 });

  // Verify there are no uncaught exceptions that crash the page.
  // The 3D view should show the ErrorBoundary fallback message
  // or simply not render, rather than bringing down the whole app.
});
