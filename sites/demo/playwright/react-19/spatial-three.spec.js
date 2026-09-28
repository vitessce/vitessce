// @ts-check
const { test, expect } = require('@playwright/test');

test('3D spatial view renders on React 19 with fiber v9', async ({ page }) => {
  /** @type {string[]} */
  const errors = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  // Load a config that uses spatialBeta with three: true.
  // With fiber v9 + React 19, 3D views should render correctly.
  await page.goto('http://localhost:3000/?dataset=kiemen-2024');
  await expect(page).toHaveTitle('Vitessce');

  // The Vitessce container should mount.
  await expect(page.locator('.vitessce-container')).toBeVisible({ timeout: 30000 });

  // A Three.js <canvas> element should be present inside the spatial view,
  // confirming that @react-three/fiber successfully initialized.
  await expect(page.locator('.vitessce-container canvas')).toBeAttached({ timeout: 15000 });

  // No uncaught exceptions should have occurred.
  expect(errors).toEqual([]);
});
