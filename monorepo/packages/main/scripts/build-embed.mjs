import * as esbuild from 'esbuild';
import path from 'path';
import * as fs from 'fs';

const env = process.env.NODE_ENV || 'development';

function injectCss(code) {
    return `\n
function __injectStyle(css) {
  const headEl = document.head || document.getElementsByTagName('head')[0];
  const styleEl = document.createElement('style');
  styleEl.type = 'text/css';
  if (styleEl.styleSheet) {
    styleEl.styleSheet.cssText = css;
  } else {
    styleEl.appendChild(document.createTextNode(css));
  }
  headEl.appendChild(styleEl);
}
__injectStyle(${JSON.stringify(code)});\n`;
}

esbuild.build({
    entryPoints: [path.resolve('./dist/vitessce.mjs')],
    outdir: path.resolve('./dist/embed'),
    target: 'es2018',
    format: 'esm',
    splitting: true,
    sourcemap: true,
    bundle: true,
    minify: env === 'production',
    //inject: [path.resolve(__dirname, '../src/alias/buffer-shim.js')],
    define: {
        'process.env.NODE_ENV': JSON.stringify(env)
    },
    plugins: [
        {
            name: 'inject-css',
            setup(build) {
                build.onLoad({ filter: /.css$/ }, async args => {
                    const p = fs.promises.readFile(args.path, {
                        encoding: 'utf-8'
                    });
                    return { contents: injectCss(await p), loader: 'js' };
                });
            }
        }
    ]
});
