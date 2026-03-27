import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const URL = 'https://www.nature.com/articles/s41592-024-02436-x';
const OUTPUT = resolve(__dirname, '../static/img/nature-methods-paper.png');

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 1600 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  console.log(`Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });

  // Dismiss any cookie/consent banners if present
  try {
    const rejectBtn = page.locator('button:has-text("Reject")');
    if (await rejectBtn.isVisible({ timeout: 3000 })) {
      await rejectBtn.click();
      console.log('Dismissed cookie banner.');
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    console.log('No cookie banner found or already dismissed.');
  }

  // Scroll to top
  await page.evaluate(() => window.scrollTo(0, 0));

  // Wait for the article title to be visible
  try {
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log('Article title element found.');
  } catch (e) {
    console.log('Warning: Could not find h1, proceeding anyway.');
  }

  // Extra time for fonts and images
  await page.waitForTimeout(3000);

  console.log(`Taking screenshot -> ${OUTPUT}`);
  await page.screenshot({ path: OUTPUT, type: 'png' });

  await browser.close();
  console.log('Done!');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
