// Usage: node scripts/sync-cdn.mjs <output-directory>

// This script is used to pull down files from public JS CDNs and save them to the local directory.
// Then, we will push the local files to our own CDN.

// This script will pull down package files based on the local package versions.

// For React and React-DOM, we pull files from esm.sh, as we rely on the ESM compilation.
// For all other packages, we pull files from unpkg.com and use the Unpkg metadata endpoint to list the file URLs.
// Example: https://unpkg.com/vitessce@latest/?meta

import fs from 'fs/promises';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const packageVersions = {
    "dynamic-importmap": ["0.1.0"],
    "@duckdb/duckdb-wasm": ["1.28.1-dev106.0", "latest"],
    "vitessce": ["latest"],
    "@vitessce/dev": ["latest"],
};

const esmShUrls = {
    "react": [
        "https://esm.sh/react@18.2.0",
        "https://esm.sh/react@18.2.0/es2022/react.mjs",
        "https://esm.sh/react@18.2.0?dev",
        "https://esm.sh/react@18.2.0/es2022/react.development.mjs",
    ],
    "react-dom": [
        "https://esm.sh/react-dom@18.2.0",
        "https://esm.sh/react-dom@18.2.0/es2022/react-dom.mjs",
        "https://esm.sh/react-dom@18.2.0?dev",
        "https://esm.sh/react-dom@18.2.0/es2022/react-dom.development.mjs",
    ],
    "react-dom/client": [
        "https://esm.sh/react-dom@18.2.0/client",
        "https://esm.sh/react-dom@18.2.0/es2022/client.mjs",
        "https://esm.sh/react-dom@18.2.0/client?dev",
        "https://esm.sh/react-dom@18.2.0/es2022/client.development.mjs",
    ],
    "scheduler": [
        "https://esm.sh/scheduler@^0.23.0?target=es2022",
        "https://esm.sh/scheduler@0.23.2/es2022/scheduler.mjs",
    ],
};

const outDir = process.argv[2];
if (!outDir) {
  console.error('Error: output directory argument is required');
  process.exit(1);
}

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function fetchWithRetry(url, init, opts) {
    const { timeoutInSeconds = 30, tries = 3 } = opts || {};
    let response;
    let controller;

    for (let n = 0; n < tries; n++) {
        let timeoutID;

        try {
            controller = new AbortController();

            timeoutID = setTimeout(() => {
                controller.abort(); // break current loop
            }, timeoutInSeconds * 1000);

            response = await fetch(
                url,
                { ...init, signal: controller.signal },
            );

            clearTimeout(timeoutID);
            return response;
        } catch (error) {
            if (timeoutID) {
                clearTimeout(timeoutID);
            }

            if (!(error instanceof DOMException)) {
                // Only catch abort exceptions here. All the others must be handled outside this function.
                throw error;
            }
        }
    }

    // None of the tries finished in time.
    throw new Error(
        `Request timed out (tried it ${tries} times, but none finished within ${timeoutInSeconds} second(s)).`
    );
}

async function downloadFile(url, outputPath) {
  try {
    const response = await fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const content = await response.text();
    await fs.writeFile(outputPath, content);
    console.log(`Downloaded: ${url} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error downloading ${url}:`, error.message);
  }
}

async function processUnpkgPackage(packageName, version) {
  const metaUrl = `https://unpkg.com/${packageName}@${version}/?meta`;
  try {
    const response = await fetch(metaUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata for ${packageName}@${version}`);
    }
    const metadata = await response.json();
    const pkgVersion = metadata.version; // In case version was "latest", we translate to the actual number.

    const jsCdn = (packageName === '@duckdb/duckdb-wasm')
        ? 'https://cdn.jsdelivr.net/npm/'
        : 'https://unpkg.com/';
    
    for (const file of metadata.files) {
        const fileUrl = `${jsCdn}${packageName}@${version}${file.path}`;
        const packageNameAndVersion = `${packageName}@${pkgVersion}`; 
        const outputPath = join(outDir, packageNameAndVersion, file.path);
        await ensureDirectoryExists(dirname(outputPath));
        await downloadFile(fileUrl, outputPath);
    }
  } catch (error) {
    console.error(`Error processing ${packageName}@${version}:`, error.message);
  }
}

async function processEsmShUrl(url) {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.substring(1).split('/');
  const packageNameAndVersion = pathParts[0];
  
  // Create a filename-safe version of the query string
  const queryString = urlObj.search.replace(/[?&=]/g, '_');
  const filename = pathParts.length > 1 ? urlObj.pathname.substring(1) + queryString : join(packageNameAndVersion, 'index.js');
  
  const outputPath = join(outDir, filename);
  await ensureDirectoryExists(dirname(outputPath));
  await downloadFile(url, outputPath);
}

async function main() {
  await ensureDirectoryExists(outDir);
  
  // Process Unpkg packages
  for (const [packageName, versions] of Object.entries(packageVersions)) {
    for (const version of versions) {
      await processUnpkgPackage(packageName, version);
    }
  }
  
  // Process ESM.sh URLs
  for (const urls of Object.values(esmShUrls)) {
    for (const url of urls) {
      await processEsmShUrl(url);
    }
  }
}

main()
