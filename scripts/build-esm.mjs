import * as esbuild from "esbuild";
import sassPlugin from "esbuild-plugin-sass";
import babel from 'esbuild-plugin-babel'
import svgr from "@svgr/core"

import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(
  await fs.promises.readFile(path.resolve(__dirname, '../package.json'))
);
/**
 * Generates an independent bundle and inlines a worker script 
 * as a default export. Import must end with `.worker`.
 *
 * import Worker from '../../path/to/my-worker.worker';
 *
 * @return {import('esbuild').Plugin}
 */
const pluginInlineWorker = () => {
  const namespace = "inline-worker";
  return {
    name: namespace,
    setup(build) {
      build.onResolve({ filter: /\.worker$/ }, (args) => {
        return {
          path: path.resolve(args.resolveDir, args.path),
          namespace,
        };
      });
      build.onLoad({ filter: /.*/, namespace }, async (args) => {
        const { outputFiles } = await esbuild.build({
          entryPoints: [args.path],
          bundle: true,
          write: false,
          format: "iife",
          minify: true,
          target: build.initialOptions.target,
        });
        if (outputFiles.length !== 1) {
          throw new Error("Too many files built for worker bundle.");
        }
        const { contents } = outputFiles[0];
        const base64 = Buffer.from(contents).toString("base64");

        // https://github.com/vitejs/vite/blob/72cb33e947e7aa72d27ed0c5eacb2457d523dfbf/packages/vite/src/node/plugins/worker.ts#L78-L87
        const code = `const encodedJs = "${base64}";
const blob = typeof window !== "undefined" && window.Blob && new Blob([atob(encodedJs)], { type: "text/javascript;charset=utf-8" });
export default function() {
  const objURL = blob && (window.URL || window.webkitURL).createObjectURL(blob);
  try {
    return objURL ? new Worker(objURL) : new Worker("data:application/javascript;base64," + encodedJs, {type: "module"});
  } finally {
    objURL && (window.URL || window.webkitURL).revokeObjectURL(objURL);
  }
}`
        return { contents: code, loader: "js" };
      });
    },
  };
};

/**
 * @type {import('esbuild').Plugin}
 *
 * Supports loading `.svg` assets as named ReactComponent.
 *
 * import { ReactComponent } from '../path/to/data.svg';
 */
const svgPlugin = {
  name: "svg",
  setup(build) {
    build.onLoad({ filter: /\.svg$/ }, async (args) => {
      const svg = await fs.promises.readFile(args.path, "utf-8");
      let contents = await svgr.default(svg, {}, { filePath: args.path });
      contents = contents.replace(
        "export default ",
        "export const ReactComponent = ",
      );
      return { contents, loader: "jsx" };
    });
  },
};


const external = [ 
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
  ...Object.keys(pkg.devDependencies),
  '@babel/*',
  '@turf/*',
  '@math.gl/*',
  '@deck.gl/*',
  '@nebula.gl/*',
  'gl-matrix/*',
  '@mapbox/*'
// Need to include `@hms-dbmi/viv` so that we can transpile down to es6 for HuBMAP
].filter(name => name !== '@hms-dbmi/viv');

const outdir = path.resolve(__dirname, '../dist/esm');
esbuild.build({
  entryPoints: [path.resolve(__dirname, "../src/index.js")],
  outdir: outdir,
  format: 'esm',
  bundle: true,
  target: 'es6',
  external: external,
  sourcemap: true,
  plugins: [
    pluginInlineWorker(),
    sassPlugin(),
    svgPlugin,
    babel({
      filter: /\/.*shader/,
    })
  ],
  loader: { '.js': 'jsx' },
});
