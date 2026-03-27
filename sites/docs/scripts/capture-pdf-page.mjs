/**
 * Capture the first page of the Vitessce Nature Methods PDF as a screenshot.
 * Downloads the PDF first, then renders it in Chrome's PDF viewer.
 */
import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { writeFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PDF_URL = 'https://www.nature.com/articles/s41592-024-02436-x.pdf';
const OUTPUT = resolve(__dirname, '../static/img/nature-methods-paper.png');
const TMP_PDF = resolve(__dirname, '../static/img/_tmp_paper.pdf');

async function main() {
  console.log('Downloading PDF...');

  // Download the PDF using fetch
  const resp = await fetch(PDF_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    redirect: 'follow',
  });

  if (!resp.ok) {
    throw new Error(`Failed to download PDF: ${resp.status} ${resp.statusText}`);
  }

  const pdfBuffer = Buffer.from(await resp.arrayBuffer());
  writeFileSync(TMP_PDF, pdfBuffer);
  console.log(`Downloaded PDF (${(pdfBuffer.length / 1024).toFixed(0)}KB)`);

  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-pdf-viewer-extension'],
  });
  const context = await browser.newContext({
    viewport: { width: 900, height: 1200 },
  });
  const page = await context.newPage();

  // Open the local PDF file
  const fileUrl = `file://${TMP_PDF}`;
  console.log(`Opening PDF in browser: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'load', timeout: 30000 });

  // Wait for the PDF viewer to render
  await page.waitForTimeout(3000);

  console.log(`Taking screenshot -> ${OUTPUT}`);
  await page.screenshot({ path: OUTPUT, type: 'png' });

  await browser.close();

  // Clean up temp PDF
  try { unlinkSync(TMP_PDF); } catch {}

  console.log('Done!');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
