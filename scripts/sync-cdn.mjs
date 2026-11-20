// Usage: node scripts/sync-cdn.mjs <output-directory>

// This script is used to pull down files from public JS CDNs and save them to the local directory.
// Then, we will push the local files to our own CDN (cdn.vitessce.io, a static S3 bucket behind CloudFront).

// There are two parts:
// 1. Unpkg packages (`packageVersions`): we pull files from unpkg.com, using the
//    Unpkg metadata endpoint to list the file URLs. Example: https://unpkg.com/vitessce@latest/?meta
// 2. Crawled esm.sh module graphs (`CRAWL_CONFIG`): starting from a set of entry points
//    (React, three.js, React Three Fiber, ...), we recursively download every module that
//    esm.sh serves for them and rewrite their imports so that they work from a static bucket.
//    At the end, we print the import map that vitessce-python's `fallbackImportMap` should use.
//
// Why rewriting is needed for part 2:
// esm.sh modules import each other via root-relative URLs which often contain
// query strings, such as "/zustand@^5.0.1?external=react&target=es2022&dev".
// The cdn.vitessce.io CloudFront distribution does not forward query strings to S3
// (`/x?dev` and `/x?target=es2022` both map to the S3 key `x`), so a static bucket
// cannot serve these. Additionally, `aws s3 sync` infers Content-Type from the file
// extension, and browsers refuse to execute module scripts served as `binary/octet-stream`.
// Therefore every root-relative/relative import is rewritten to a deterministic,
// query-free, root-relative static path ending in `.js` or `.mjs`:
// - esm.sh build files (e.g. "/three@0.162.0/es2022/three.development.mjs") keep their path.
// - Entry points get stable names, e.g. "/three@0.162.0/index_dev.js",
//   "/react-dom@19.2.6/client_dev.js", "/three@0.162.0/addons/loaders/GLTFLoader_dev.js".
// - Other esm.sh "stub" modules (URLs with query strings / semver ranges) are saved as
//   "/<name>@<resolved-version>/<subpath-or-index>_<hash>[_dev].js", where <hash> is
//   derived from the full esm.sh URL.
// Bare specifiers (e.g. "react", "three") are left as-is and resolved by the import map.

import fs from 'fs/promises';
import { createHash } from 'crypto';
import { join, dirname } from 'path';

// ============================================================================
// Crawled esm.sh module graphs. Bump versions here.
// Keep in sync with the `importMap` in vitessce-python's src/vitessce/widget.py.
// ============================================================================
const CRAWL_CONFIG = {
  esmShOrigin: 'https://esm.sh',
  cdnOrigin: 'https://cdn.vitessce.io',
  esmShTarget: 'es2022',
  // A separate (self-consistent) graph is crawled for each mode.
  // dev: esm.sh `?dev` builds (*.development.mjs). prod: production builds.
  modes: ['dev', 'prod'],
  // Entry points of the fallback import map.
  // `pkg` must use exact versions (no `^`/`~` ranges), so that the mirrored files are reproducible.
  // `external` lists packages that esm.sh should leave as bare specifiers
  // (they are resolved via the import map, which prevents duplicate instances).
  importMapEntries: [
    { specifier: 'react', pkg: 'react@19.2.6' },
    { specifier: 'react/jsx-runtime', pkg: 'react@19.2.6', subpath: 'jsx-runtime' },
    { specifier: 'react-dom', pkg: 'react-dom@19.2.6' },
    { specifier: 'react-dom/client', pkg: 'react-dom@19.2.6', subpath: 'client' },
    { specifier: 'three', pkg: 'three@0.162.0' },
    // Subpaths of three that are imported by Vitessce or by the packages below.
    // A static bucket cannot serve a generic "three/" prefix mapping, so each subpath is listed.
    // The static checks at the end of the crawl fail if a needed subpath is missing here.
    { specifier: 'three/addons/loaders/GLTFLoader.js', pkg: 'three@0.162.0', subpath: 'addons/loaders/GLTFLoader.js', external: ['three'] },
    { specifier: 'three/addons/loaders/DRACOLoader.js', pkg: 'three@0.162.0', subpath: 'addons/loaders/DRACOLoader.js', external: ['three'] },
    { specifier: 'three/examples/jsm/loaders/GLTFLoader.js', pkg: 'three@0.162.0', subpath: 'examples/jsm/loaders/GLTFLoader.js', external: ['three'] },
    { specifier: 'three/src/math/MathUtils.js', pkg: 'three@0.162.0', subpath: 'src/math/MathUtils.js', external: ['three'] },
    { specifier: 'three/examples/jsm/utils/SkeletonUtils.js', pkg: 'three@0.162.0', subpath: 'examples/jsm/utils/SkeletonUtils.js', external: ['three'] },
    { specifier: '@react-three/fiber', pkg: '@react-three/fiber@9.8.2', external: ['react', 'react-dom', 'three'] },
    { specifier: '@react-three/drei', pkg: '@react-three/drei@10.7.9', external: ['react', 'react-dom', 'three', '@react-three/fiber'] },
    { specifier: '@react-three/xr', pkg: '@react-three/xr@6.6.32', external: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei', '@pmndrs/pointer-events', '@pmndrs/handle'] },
    // @pmndrs/pointer-events and @pmndrs/handle import three without declaring it as a dependency,
    // so esm.sh would otherwise resolve their `three` imports to the latest three version.
    // (@pmndrs/handle is reached via a dynamic import: @pmndrs/xr store -> emulate -> @iwer/devui -> @pmndrs/handle.)
    { specifier: '@pmndrs/pointer-events', pkg: '@pmndrs/pointer-events@6.6.32', external: ['three'] },
    { specifier: '@pmndrs/handle', pkg: '@pmndrs/handle@6.6.32', external: ['three', '@pmndrs/pointer-events'] },
  ],
  // Additional entry points that are crawled but not part of the printed import map.
  // These are React versions used by other/older consumers of cdn.vitessce.io
  // (e.g., older vitessce-python releases use react@18.2.0/index.js and
  // react-dom@18.2.0/es2022/client.mjs). Each produces react@<v>/index{,_dev}.js,
  // react-dom@<v>/index{,_dev}.js, react-dom@<v>/client{,_dev}.js, and the
  // es2022/*.mjs build files (including their scheduler dependency).
  additionalEntries: ['18.2.0', '18.3.0', '19.0.0', '19.2.6', '19.2.7'].flatMap(version => [
    { pkg: `react@${version}` },
    { pkg: `react@${version}`, subpath: 'jsx-runtime' },
    { pkg: `react@${version}`, subpath: 'jsx-dev-runtime' },
    { pkg: `react-dom@${version}` },
    { pkg: `react-dom@${version}`, subpath: 'client' },
  ]),
  // Packages that must be loaded exactly once per graph (checked after crawling).
  singletonPackages: ['react', 'react-dom', 'three'],
};

// ============================================================================
// Unpkg packages.
// ============================================================================
const packageVersions = {
    "dynamic-importmap": ["0.1.0"],
    "@duckdb/duckdb-wasm": ["1.28.1-dev106.0", "1.29.1-dev132.0"], // TODO: sync with version used in this repo (once using).
    "vitessce": ["latest"],
    "@vitessce/dev": ["latest"],
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
    // Use arrayBuffer (not text) so that binary files (e.g., .wasm) are written byte-for-byte.
    const content = Buffer.from(await response.arrayBuffer());
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

// ============================================================================
// Recursive esm.sh crawler
// ============================================================================

// Matches `from "x"`, `import "x"`, and `import("x")` (also in minified code, e.g. `from"x"`).
// esm.sh (esbuild) always emits import specifiers in double quotes, followed by `;`, `)`, `,`,
// a newline, or the end of the file. Requiring this avoids false positives from prose in
// string literals, e.g. "Instead use `import { create } from 'zustand'`" or
// `Converting vertex colors from "srgb-linear" to ...`.
const IMPORT_SPECIFIER_RE = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)(")([^"\n\r]+)"(?=\s*(?:[;),\n]|$))/g;
// Used to detect esm.sh-style imports that were missed by IMPORT_SPECIFIER_RE (and thus not rewritten).
const UNREWRITTEN_ESM_SH_IMPORT_RE = /["'](?:https:\/\/esm\.sh)?\/[^"'\s]*[?&]target=[^"'\s]*["']/g;
// Bare specifier: an npm package name with an optional subpath.
const BARE_SPECIFIER_RE = /^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(\/[\w./@-]*)?$/i;
// esm.sh build file paths that can be stored in the static bucket as-is.
const STATIC_SAFE_PATH_RE = /^\/[A-Za-z0-9@._+\-/]+\.m?js$/;
// First line of every esm.sh module, e.g. `/* esm.sh - @react-three/fiber@9.8.2 */`.
const ESM_SH_HEADER_RE = /^\/\* esm\.sh - (\S+) \*\//;
// `name@version[/subpath]`, where name may be scoped.
const PKG_ID_RE = /^((?:@[^/@]+\/)?[^/@]+)@([^/]+)(?:\/(.*))?$/;

function parsePkgId(pkgId) {
  const match = pkgId.match(PKG_ID_RE);
  if (!match) return null;
  return { name: match[1], version: match[2], subpath: match[3] || null };
}

function isEsmShUrl(url) {
  return url.startsWith(`${CRAWL_CONFIG.esmShOrigin}/`);
}

function isLocalSpecifier(specifier) {
  if (/\s/.test(specifier)) return false;
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    // esm.sh always emits relative imports with a file extension, e.g. "./react-dom.development.mjs"
    // or "../../lib/captures/office_small.json?module" (in @iwer/sem).
    // Extension-less ones are false positives from code samples in string literals.
    return /\.[A-Za-z0-9]+(\?[^"\s]*)?$/.test(specifier);
  }
  return specifier.startsWith('/') || specifier.startsWith(`${CRAWL_CONFIG.esmShOrigin}/`);
}

function getEntryUrl(entry, mode) {
  const { esmShOrigin, esmShTarget } = CRAWL_CONFIG;
  const params = [];
  if (mode === 'dev') params.push('dev');
  if (entry.external && entry.external.length > 0) params.push(`external=${entry.external.join(',')}`);
  params.push(`target=${esmShTarget}`);
  const subpath = entry.subpath ? `/${entry.subpath}` : '';
  return `${esmShOrigin}/${entry.pkg}${subpath}?${params.join('&')}`;
}

// Stable path for an entry point, e.g.
// /three@0.162.0/index_dev.js, /react-dom@19.2.6/client.js, /three@0.162.0/addons/loaders/GLTFLoader_dev.js
function getEntryStaticPath(entry, mode, header) {
  const resolved = header && parsePkgId(header);
  if (!resolved) {
    throw new Error(`Could not determine resolved version for entry ${entry.pkg} (header: ${header})`);
  }
  const fileStem = entry.subpath ? entry.subpath.replace(/\.m?js$/, '') : 'index';
  return `/${resolved.name}@${resolved.version}/${fileStem}${mode === 'dev' ? '_dev' : ''}.js`;
}

function shortHash(str) {
  return createHash('sha256').update(str).digest('hex').substring(0, 10);
}

// Deterministic, query-free path for a non-entry esm.sh module.
function getModuleStaticPath(mod) {
  const urlObj = new URL(mod.url);
  if (!urlObj.search && STATIC_SAFE_PATH_RE.test(urlObj.pathname)) {
    // A build file, e.g. /three-stdlib@2.36.1/X-ZXRocmVl/es2022/three-stdlib.development.mjs
    return urlObj.pathname;
  }
  const pathAndQuery = urlObj.pathname + urlObj.search;
  const hash = shortHash(pathAndQuery);
  const isDev = urlObj.searchParams.has('dev');
  const sanitize = str => str.replace(/[^A-Za-z0-9@._\-/]/g, '_');
  const resolved = mod.header && parsePkgId(mod.header);
  // With an esm.sh header (e.g. `zustand@5.0.8/traditional`), use the resolved version:
  //   /zustand@5.0.8/traditional_<hash>_dev.js
  // Otherwise (e.g. JSON modules such as /@iwer/sem@0.2.5/lib/captures/office_small.json?module),
  // use the original path: /@iwer/sem@0.2.5/lib/captures/office_small.json_<hash>.js
  const stem = resolved
    ? `${resolved.name}@${resolved.version}/${resolved.subpath ? resolved.subpath.replace(/\.m?js$/, '') : 'index'}`
    : urlObj.pathname.substring(1).replace(/\.m?js$/, '');
  const ext = mod.isJavaScript ? '.js' : (urlObj.pathname.match(/\.[A-Za-z0-9]+$/)?.[0] || '');
  return `/${sanitize(stem)}_${hash}${isDev ? '_dev' : ''}${ext}`;
}

function getSpecifiers(text) {
  return Array.from(text.matchAll(IMPORT_SPECIFIER_RE), match => match[3]);
}

async function fetchEsmShModule(url) {
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  // Use the final URL (after redirects) as the base for relative imports.
  const finalUrl = response.url || url;
  if (!isEsmShUrl(finalUrl)) {
    throw new Error(`${url} redirected to non-esm.sh URL ${finalUrl}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || '';
  const isJavaScript = contentType.includes('javascript');
  const mod = {
    url,
    finalUrl,
    bytes,
    isJavaScript,
    text: null,
    header: null,
    localDeps: new Map(), // specifier -> absolute esm.sh URL
    bareSpecifiers: new Set(),
  };
  if (isJavaScript) {
    mod.text = bytes.toString('utf8');
    mod.header = mod.text.match(ESM_SH_HEADER_RE)?.[1] || null;
    for (const specifier of getSpecifiers(mod.text)) {
      if (isLocalSpecifier(specifier)) {
        mod.localDeps.set(specifier, new URL(specifier, finalUrl).href);
      } else if (/^[a-z][a-z0-9+.-]*:/i.test(specifier)) {
        // Absolute URL to some other origin (e.g., https://unpkg.com/...). Not expected.
        throw new Error(`${url} imports a non-esm.sh absolute URL: ${specifier}`);
      } else if (BARE_SPECIFIER_RE.test(specifier)) {
        mod.bareSpecifiers.add(specifier);
      }
    }
  }
  return mod;
}

// Download all modules reachable from `entryUrls` (via root-relative and relative imports).
// `moduleCache` maps esm.sh URL -> module and is shared across calls.
// Returns the set of URLs reachable from the entries.
async function crawlEsmSh(entryUrls, moduleCache, errors) {
  const reachable = new Set();
  const queue = [...entryUrls];
  // Breadth-first traversal, downloading one module at a time.
  while (queue.length > 0) {
    const url = queue.shift();
    if (!reachable.has(url)) {
      reachable.add(url);
      if (!moduleCache.has(url)) {
        try {
          moduleCache.set(url, await fetchEsmShModule(url));
          console.log(`Crawled: ${url}`);
        } catch (error) {
          errors.push(error.message);
          console.error(`Error crawling ${url}:`, error.message);
        }
      }
      if (moduleCache.has(url)) {
        queue.push(...moduleCache.get(url).localDeps.values());
      }
    }
  }
  return reachable;
}

function rewriteModuleText(mod, urlToStaticPath) {
  return mod.text.replace(IMPORT_SPECIFIER_RE, (match, prefix, quote, specifier) => {
    if (!isLocalSpecifier(specifier)) return match;
    const depUrl = mod.localDeps.get(specifier);
    const staticPath = urlToStaticPath.get(depUrl);
    if (!staticPath) {
      throw new Error(`No static path for ${depUrl} (imported by ${mod.url})`);
    }
    return `${prefix}${quote}${staticPath}${quote}`;
  });
}

// Static checks on each graph:
// - every bare specifier resolves via the import map
// - each singleton package (e.g., three, react) resolves to exactly one module URL
function checkGraph(mode, reachable, moduleCache, importMap, urlToStaticPath) {
  const problems = [];
  const mapped = importMap.imports;
  for (const url of reachable) {
    const mod = moduleCache.get(url);
    if (!mod) continue;
    for (const specifier of mod.bareSpecifiers) {
      const isMapped = specifier in mapped
        || Object.keys(mapped).some(key => key.endsWith('/') && specifier.startsWith(key));
      if (!isMapped) {
        problems.push(`[${mode}] ${urlToStaticPath.get(url)} imports unmapped bare specifier "${specifier}"`);
      }
    }
  }
  for (const pkgName of CRAWL_CONFIG.singletonPackages) {
    // A package's main module is the esm.sh build file whose header is `name@version` (no subpath).
    const mainModules = new Set();
    for (const url of reachable) {
      const mod = moduleCache.get(url);
      const resolved = mod?.header && parsePkgId(mod.header);
      const isBuildFile = !new URL(url).search && /\.m?js$/.test(new URL(url).pathname);
      if (resolved && isBuildFile && resolved.name === pkgName && !resolved.subpath) {
        mainModules.add(urlToStaticPath.get(url));
      }
    }
    if (mainModules.size !== 1) {
      problems.push(`[${mode}] expected exactly one module for "${pkgName}", found ${mainModules.size}: ${[...mainModules].join(', ')}`);
    } else {
      console.log(`[${mode}] "${pkgName}" resolves to exactly one module: ${[...mainModules][0]}`);
    }
  }
  // Each copy of three sets `__THREE__` (this triggers the "Multiple instances" warning).
  const threeCopies = [...reachable]
    .filter(url => moduleCache.get(url)?.text?.includes('__THREE__'))
    .map(url => urlToStaticPath.get(url));
  if (threeCopies.length !== 1) {
    problems.push(`[${mode}] expected exactly one module defining __THREE__, found ${threeCopies.length}: ${threeCopies.join(', ')}`);
  }
  return problems;
}

async function processCrawledEsmSh() {
  const { importMapEntries, additionalEntries, modes, cdnOrigin } = CRAWL_CONFIG;
  const moduleCache = new Map();
  const errors = [];
  const reachableByMode = {};
  // URL -> stable static path, for entry points.
  const entryStaticPaths = new Map();
  const importMaps = {};

  const allEntries = [...importMapEntries, ...additionalEntries];
  for (const mode of modes) {
    // The import map entries form one graph per mode (checked below);
    // the additional entries are crawled separately so that they are not part of that graph.
    const entryUrls = importMapEntries.map(entry => getEntryUrl(entry, mode));
    reachableByMode[mode] = await crawlEsmSh(entryUrls, moduleCache, errors);
    await crawlEsmSh(additionalEntries.map(entry => getEntryUrl(entry, mode)), moduleCache, errors);
  }
  if (errors.length > 0) {
    throw new Error(`Failed to crawl ${errors.length} esm.sh module(s):\n${errors.join('\n')}`);
  }

  // Assign static paths.
  for (const mode of modes) {
    importMaps[mode] = { imports: {} };
    for (const entry of allEntries) {
      const url = getEntryUrl(entry, mode);
      const staticPath = getEntryStaticPath(entry, mode, moduleCache.get(url).header);
      entryStaticPaths.set(url, staticPath);
      if (entry.specifier) {
        importMaps[mode].imports[entry.specifier] = `${cdnOrigin}${staticPath}`;
      }
    }
  }
  const urlToStaticPath = new Map();
  const staticPathToUrl = new Map();
  for (const [url, mod] of moduleCache) {
    const staticPath = entryStaticPaths.get(url) || getModuleStaticPath(mod);
    if (staticPathToUrl.has(staticPath) && staticPathToUrl.get(staticPath) !== url) {
      throw new Error(`Static path collision at ${staticPath}: ${staticPathToUrl.get(staticPath)} and ${url}`);
    }
    urlToStaticPath.set(url, staticPath);
    staticPathToUrl.set(staticPath, url);
  }
  // Write files (with imports rewritten to static paths).
  const problems = [];
  for (const [url, mod] of moduleCache) {
    const staticPath = urlToStaticPath.get(url);
    let content = mod.bytes;
    if (mod.isJavaScript) {
      content = rewriteModuleText(mod, urlToStaticPath);
      const missed = content.match(UNREWRITTEN_ESM_SH_IMPORT_RE);
      if (missed) {
        problems.push(`${staticPath} contains esm.sh import(s) that were not rewritten: ${missed.join(', ')}`);
      }
    }
    const outputPath = join(outDir, ...staticPath.substring(1).split('/'));
    await ensureDirectoryExists(dirname(outputPath));
    await fs.writeFile(outputPath, content);
  }
  console.log(`Wrote ${moduleCache.size} crawled esm.sh modules to ${outDir}`);

  // Static checks.
  problems.push(...modes.flatMap(mode => checkGraph(
    mode, reachableByMode[mode], moduleCache, importMaps[mode], urlToStaticPath,
  )));

  // Write and print the import maps for vitessce-python's fallbackImportMap.
  for (const mode of modes) {
    const fileName = `importmap-fallback-${mode}.json`;
    await fs.writeFile(join(outDir, fileName), `${JSON.stringify(importMaps[mode], null, 2)}\n`);
    console.log(`\nFallback import map (${mode}) for vitessce-python widget.py (also written to ${join(outDir, fileName)}):`);
    console.log(JSON.stringify(importMaps[mode], null, 2));
  }

  if (problems.length > 0) {
    throw new Error(`Static checks of crawled esm.sh graphs failed:\n${problems.join('\n')}`);
  }
}

async function main() {
  await ensureDirectoryExists(outDir);

  // Process Unpkg packages
  for (const [packageName, versions] of Object.entries(packageVersions)) {
    for (const version of versions) {
      await processUnpkgPackage(packageName, version);
    }
  }

  // Process crawled esm.sh module graphs.
  await processCrawledEsmSh();
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
