/**
 * Screenshot generation script for Vitessce example configs.
 *
 * Generates both light-mode and dark-mode screenshots for each config.
 *
 * Prerequisites:
 *   - pnpm add -D playwright (in sites/docs)
 *   - npx playwright install chromium
 *   - The docs dev server must be running: pnpm start (port 3001)
 *
 * Usage:
 *   node sites/docs/scripts/generate-screenshots.mjs
 *   node sites/docs/scripts/generate-screenshots.mjs codeluppi-2018 eng-2019
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, '../static/img/examples');
const BASE_URL = process.env.VITESSCE_DEV_URL || 'http://localhost:3001';
const VIEWPORT = { width: 1920, height: 800 };

// Time to wait for the Vitessce container to appear.
const CONTAINER_TIMEOUT = 120_000;
// Time to wait after container appears for data to load.
const POST_CONTAINER_DELAY = 15_000;
// Minimum acceptable screenshot file size (20KB). Smaller = likely empty/loading.
const MIN_FILE_SIZE = 20_000;
// Number of parallel browser tabs.
const CONCURRENCY = 1;

// Both themes to capture.
const THEMES = ['light', 'dark'];

const ALL_CONFIGS = [
  'codeluppi-2018',
  'codeluppi-2018-via-zarr',
  'eng-2019',
  'wang-2018',
  'spraggins-2020',
  'neumann-2020',
  'satija-2020',
  'sn-atac-seq-hubmap-2020',
  'blin-2019',
  'human-lymph-node-10x-visium',
  'habib-2017',
  'marshall-2022',
  'kuppe-2022',
  'combat-2022',
  'meta-2022-azimuth',
  'salcher-2022',
  'spatialdata-visium',
  'spatialdata-visium_io',
  'spatialdata-mcmicro_io',
  'maynard-2021',
  'jain-2024',
  'sorger-2024-2',
  'sorger-2024-4',
];

const HERO_CONFIG = 'codeluppi-2018';

const HIDE_UI_CSS = `
  .navbar, footer, .demo-header, .vitessce-toolbar,
  .demoHeaderContainer { display: none !important; }
  .vitessce-and-toolbar {
    top: 0 !important;
    height: 100vh !important;
    position: fixed !important;
    width: 100% !important;
  }
  .vitessce-app .vitessce-container {
    width: 100% !important;
    left: 0 !important;
  }
`;

/**
 * Set the Vitessce theme (light or dark) via the Docusaurus data-theme attribute
 * and Vitessce's own theme class.
 */
function getThemeCSS(theme) {
  if (theme === 'dark') {
    return `
      ${HIDE_UI_CSS}
      .vitessce-container { background: #333 !important; }
    `;
  }
  return HIDE_UI_CSS;
}

/**
 * Capture a screenshot of a Vitessce config in a specific theme.
 */
async function captureScreenshot(context, configKey, theme, outputPath) {
  const page = await context.newPage();

  try {
    const themeParam = theme === 'dark' ? '&theme=dark' : '';
    const url = `${BASE_URL}/#?dataset=${configKey}${themeParam}`;
    console.log(`  [${configKey}/${theme}] Loading page...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    // Set the Docusaurus theme attribute for proper styling.
    if (theme === 'dark') {
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
      });
    }

    // Inject the CSS to hide UI elements.
    await page.addStyleTag({ content: getThemeCSS(theme) });

    // Wait for the Vitessce container to appear.
    console.log(`  [${configKey}/${theme}] Waiting for Vitessce container...`);
    try {
      await page.waitForSelector('.vitessce-container', {
        state: 'visible',
        timeout: CONTAINER_TIMEOUT,
      });
      console.log(`  [${configKey}/${theme}] Container visible. Waiting for data to render...`);
    } catch {
      console.warn(`  [${configKey}/${theme}] Container did not appear within timeout.`);
    }

    // Wait for data to load.
    await page.waitForTimeout(POST_CONTAINER_DELAY);

    // Re-inject CSS in case Docusaurus hot-reload removed it.
    await page.addStyleTag({ content: getThemeCSS(theme) });
    await page.waitForTimeout(500);

    // Capture.
    await page.screenshot({ path: outputPath, type: 'png' });

    const size = statSync(outputPath).size;
    if (size < MIN_FILE_SIZE) {
      console.warn(`  [${configKey}/${theme}] Warning: screenshot only ${(size / 1024).toFixed(1)}KB — may be empty/loading state.`);
    } else {
      console.log(`  [${configKey}/${theme}] Saved (${(size / 1024).toFixed(0)}KB): ${outputPath}`);
    }
  } catch (err) {
    console.error(`  [${configKey}/${theme}] Error: ${err.message}`);
  } finally {
    await page.close();
  }
}

async function main() {
  const cliArgs = process.argv.slice(2);

  // Parse optional --theme=light or --theme=dark flag.
  const themeArg = cliArgs.find(a => a.startsWith('--theme='));
  const themesToCapture = themeArg
    ? [themeArg.split('=')[1]]
    : THEMES;
  const configArgs = cliArgs.filter(a => !a.startsWith('--'));

  const configsToCapture = configArgs.length > 0
    ? configArgs.filter(c => ALL_CONFIGS.includes(c) || c === 'hero')
    : ALL_CONFIGS;

  if (configArgs.length > 0 && configsToCapture.length === 0) {
    console.error(`None of the specified configs are valid: ${configArgs.join(', ')}`);
    console.error(`Valid: ${ALL_CONFIGS.join(', ')}`);
    process.exit(1);
  }

  // Create output directories for each theme.
  for (const theme of themesToCapture) {
    const themeDir = resolve(OUTPUT_DIR, theme);
    if (!existsSync(themeDir)) {
      mkdirSync(themeDir, { recursive: true });
    }
  }

  console.log(`Generating screenshots for ${configsToCapture.length} configs x ${themesToCapture.length} themes...`);
  console.log(`Output:      ${OUTPUT_DIR}`);
  console.log(`Server:      ${BASE_URL}`);
  console.log(`Viewport:    ${VIEWPORT.width}x${VIEWPORT.height}`);
  console.log(`Themes:      ${themesToCapture.join(', ')}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Post-load delay: ${POST_CONTAINER_DELAY / 1000}s\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });

  const realConfigs = configsToCapture.filter(c => c !== 'hero');
  let totalGood = 0;
  let totalBad = 0;
  const badKeys = [];

  for (const theme of themesToCapture) {
    console.log(`\n==================== Theme: ${theme} ====================`);
    const themeDir = resolve(OUTPUT_DIR, theme);

    for (let i = 0; i < realConfigs.length; i += CONCURRENCY) {
      const batch = realConfigs.slice(i, i + CONCURRENCY);
      const batchNum = Math.floor(i / CONCURRENCY) + 1;
      const totalBatches = Math.ceil(realConfigs.length / CONCURRENCY);
      console.log(`\n--- [${theme}] Batch ${batchNum}/${totalBatches}: ${batch.join(', ')} ---`);

      await Promise.all(
        batch.map(key =>
          captureScreenshot(context, key, theme, resolve(themeDir, `${key}.png`))
        )
      );
    }

    // Hero screenshot.
    if (!configArgs.length || configArgs.includes('hero')) {
      console.log(`\n--- [${theme}] Hero screenshot (${HERO_CONFIG}) ---`);
      await captureScreenshot(context, HERO_CONFIG, theme, resolve(themeDir, 'hero.png'));
    }

    // Count results for this theme.
    const allKeys = [...realConfigs, ...((!configArgs.length || configArgs.includes('hero')) ? ['hero'] : [])];
    for (const key of allKeys) {
      const filePath = resolve(themeDir, `${key}.png`);
      if (existsSync(filePath) && statSync(filePath).size >= MIN_FILE_SIZE) {
        totalGood++;
      } else {
        totalBad++;
        badKeys.push(`${key}/${theme}`);
      }
    }
  }

  await browser.close();

  const totalExpected = (realConfigs.length + ((!configArgs.length || configArgs.includes('hero')) ? 1 : 0)) * themesToCapture.length;
  console.log(`\n========================================`);
  console.log(`Done! ${totalGood}/${totalExpected} screenshots look good.`);
  if (badKeys.length > 0) {
    console.log(`${badKeys.length} may be empty/loading: ${badKeys.join(', ')}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
