const webpack = require('webpack');

const NEUROGLANCER_PATH_RE = /[\\/]node_modules[\\/]neuroglancer[\\/]/;
const RAW_QUERY_RE = /(^|[?&])raw($|&)/;

// We need to make a custom Docusaurus plugin so that we can support
// the "node:fs" imports within the @zarrita/storage package.
// Reference: https://github.com/vercel/next.js/issues/28774#issuecomment-1264555395
// Reference: https://github.com/manzt/zarrita.js/blob/fba5325bb83949aa5a5f036841653e183efc4ee1/packages/storage/src/fs.ts#L1
module.exports = function(context, options) {
  return {
    name: 'vitessce-docusaurus-plugin',
    configureWebpack(config, isServer, utils) {
      // Neuroglancer imports its icons as `import svg from './icon.svg?raw'` (Vite syntax),
      // expecting the SVG markup as a string. Docusaurus' own .svg rule would instead
      // return a URL, so exclude `?raw` imports from the existing rules that match .svg files.
      config.module.rules.forEach((rule) => {
        if (rule && rule.test instanceof RegExp && rule.test.test('icon.svg')) {
          // eslint-disable-next-line no-param-reassign
          rule.resourceQuery = { not: [RAW_QUERY_RE] };
        }
      });
      return {
        module: {
          rules: [
            // Load `?raw` imports as source text, like Vite.
            { resourceQuery: RAW_QUERY_RE, type: 'asset/source' },
          ],
        },
        resolve: {
          fallback: {
            fs: false,
            path: false,
          },
        },
        plugins: [
          new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
            resource.request = resource.request.replace(/^node:/, "");
          }),
          // Drop the CSS imported by Neuroglancer's modules (e.g. `import "#src/viewer.css"`),
          // which would otherwise be injected globally. The styles that we need are defined
          // in @vitessce/neuroglancer (styles.js). Same as ignoreNeuroglancerCss() in the
          // root vite.config.mjs.
          new webpack.NormalModuleReplacementPlugin(/\.css$/, (resource) => {
            if (NEUROGLANCER_PATH_RE.test(resource.context || '')) {
              resource.request = 'data:text/javascript,';
            }
          }),
        ],
      };
    },
  };
};
