// Builds self-contained, inlined Neuroglancer worker scripts.
//
// Mainline Neuroglancer creates its workers with
//   new Worker(new URL('./chunk_worker.bundle.js', import.meta.url), { type: 'module' })
// and loads WebAssembly decoders with
//   fetch(new URL('./x.wasm', import.meta.url))
// which requires every consumer's bundler to emit those files next to the
// bundle (and breaks for cross-origin/CDN usage, e.g. vitessce-python).
//
// Instead, we bundle each worker entry point (plus all of its dependencies,
// WASM included) into a single classic-worker IIFE string, and export a
// factory that starts the worker from a Blob URL. The async-computation
// worker is spawned from inside the chunk worker (a nested worker), so its
// code is embedded in the chunk worker bundle.
//
// Output: dist/index.js exporting `ChunkWorker`.

import {
  readFileSync, writeFileSync, mkdirSync, rmSync, realpathSync,
} from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// neuroglancer's "exports" does not expose ./package.json, so locate it directly.
const ngDir = realpathSync(join(pkgDir, 'node_modules', 'neuroglancer'));
const ngPkg = JSON.parse(readFileSync(join(ngDir, 'package.json'), 'utf8'));

const ASYNC_WORKER_VIRTUAL_ID = '\0vitessce-ng-async-worker';

// Resolve Neuroglancer's package-internal subpath imports ("#src/...", "#datasource/...").
// Picks the "default" condition, i.e. all datasources/kvstores enabled.
function resolveSubpathImport(specifier) {
  const { imports } = ngPkg;
  const pick = (target) => {
    if (typeof target === 'string') return target;
    if (target && typeof target === 'object') return pick(target.default);
    return undefined;
  };
  if (specifier in imports) {
    const t = pick(imports[specifier]);
    return t && join(ngDir, t);
  }
  // Longest wildcard pattern match, e.g. "#src/*.js" -> "./lib/*.js".
  const patterns = Object.keys(imports)
    .filter(k => k.includes('*'))
    .sort((a, b) => b.length - a.length);
  for (const key of patterns) {
    const [prefix, suffix] = key.split('*');
    if (specifier.startsWith(prefix) && specifier.endsWith(suffix)
      && specifier.length >= prefix.length + suffix.length) {
      const middle = specifier.slice(prefix.length, specifier.length - suffix.length);
      const t = pick(imports[key]);
      return t && join(ngDir, t.replace('*', middle));
    }
  }
  return undefined;
}

function neuroglancerSubpathImports() {
  return {
    name: 'neuroglancer-subpath-imports',
    resolveId(source) {
      if (!source.startsWith('#')) return null;
      const resolved = resolveSubpathImport(source);
      if (!resolved) throw new Error(`Unresolved Neuroglancer subpath import: ${source}`);
      return resolved;
    },
  };
}

// Workers never render DOM; drop CSS and raw-SVG imports if any are reachable.
function ignoreAssets() {
  return {
    name: 'ignore-assets',
    resolveId(source) {
      if (source.endsWith('.css') || /\.svg\?raw$/.test(source)) return `\0empty:${source}`;
      return null;
    },
    load(id) {
      if (id.startsWith('\0empty:')) return id.endsWith('.css') ? '' : 'export default "";';
      return null;
    },
  };
}

// fetch(new URL('./x.wasm', import.meta.url)) -> fetch('data:application/wasm;base64,...')
function inlineWasmUrls() {
  const re = /new URL\(\s*(["'])([^"']+\.wasm)\1\s*,\s*import\.meta\.url\s*\)/g;
  return {
    name: 'inline-wasm-urls',
    transform(code, id) {
      if (!code.includes('.wasm') || !code.includes('import.meta.url')) return null;
      let changed = false;
      const out = code.replace(re, (_m, _q, rel) => {
        const wasmPath = resolve(dirname(id), rel);
        const b64 = readFileSync(wasmPath).toString('base64');
        changed = true;
        return JSON.stringify(`data:application/wasm;base64,${b64}`);
      });
      return changed ? { code: out, map: null } : null;
    },
  };
}

// Replace the nested async-computation worker construction in
// async_computation/request.js with a Blob-URL worker from the inlined code.
function inlineAsyncComputationWorker(asyncWorkerCode) {
  const re = /new Worker\(\s*(?:\/\*[^*]*\*\/\s*)?new URL\(\s*["']\.\.\/async_computation\.bundle\.js["']\s*,\s*import\.meta\.url\s*\)\s*,\s*\{\s*type:\s*["']module["']\s*\}\s*\)/;
  return {
    name: 'inline-async-computation-worker',
    resolveId(source) {
      return source === ASYNC_WORKER_VIRTUAL_ID ? source : null;
    },
    load(id) {
      if (id !== ASYNC_WORKER_VIRTUAL_ID) return null;
      return `
const code = ${JSON.stringify(asyncWorkerCode)};
let url;
export function createAsyncComputationWorker() {
  if (!url) url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
  return new Worker(url);
}`;
    },
    transform(code, id) {
      if (!id.endsWith(join('async_computation', 'request.js'))) return null;
      if (!re.test(code)) {
        throw new Error('Could not find the async computation worker construction in request.js; Neuroglancer changed?');
      }
      return {
        code: `import { createAsyncComputationWorker } from ${JSON.stringify(ASYNC_WORKER_VIRTUAL_ID)};\n${code.replace(re, 'createAsyncComputationWorker()')}`,
        map: null,
      };
    },
  };
}

async function bundleWorker(entry, extraPlugins = []) {
  const bundle = await rollup({
    input: join(ngDir, 'lib', entry),
    plugins: [
      ...extraPlugins,
      neuroglancerSubpathImports(),
      ignoreAssets(),
      inlineWasmUrls(),
      nodeResolve({ browser: true, exportConditions: ['browser', 'import', 'default'] }),
      commonjs(),
    ],
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY' || warning.code === 'THIS_IS_UNDEFINED') return;
      warn(warning);
    },
  });
  const { output } = await bundle.generate({ format: 'iife', inlineDynamicImports: true });
  await bundle.close();
  const { code } = output[0];
  if (code.includes('import.meta')) {
    throw new Error(`${entry}: bundled worker still references import.meta; something was not inlined.`);
  }
  return code;
}

const asyncWorkerCode = await bundleWorker('async_computation.bundle.js');
const chunkWorkerCode = await bundleWorker(
  'chunk_worker.bundle.js',
  [inlineAsyncComputationWorker(asyncWorkerCode)],
);

const distDir = join(pkgDir, 'dist');
rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, 'index.js'), `// Generated by scripts/build.mjs from neuroglancer@${ngPkg.version}. Do not edit.
const chunkWorkerCode = ${JSON.stringify(chunkWorkerCode)};
let chunkWorkerUrl;

/**
 * Start Neuroglancer's chunk worker from inlined code.
 * Usable with or without \`new\`; returns a Worker.
 * The chunk worker spawns its own async-computation workers (nested),
 * which are terminated along with it.
 * @returns {Worker}
 */
export function ChunkWorker() {
  if (!chunkWorkerUrl) {
    chunkWorkerUrl = URL.createObjectURL(new Blob([chunkWorkerCode], { type: 'text/javascript' }));
  }
  return new Worker(chunkWorkerUrl);
}
`);
const kb = n => `${(n / 1024).toFixed(0)} KiB`;
console.log(`neuroglancer@${ngPkg.version}: async worker ${kb(asyncWorkerCode.length)}, chunk worker ${kb(chunkWorkerCode.length)}`);
