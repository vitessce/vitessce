const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../../src');

// We need to make a custom Docusaurus plugin to be able to configure webpack.
// Reference: https://v2.docusaurus.io/docs/using-plugins#creating-plugins
// Reference: https://v2.docusaurus.io/docs/lifecycle-apis#configurewebpackconfig-isserver-utils
module.exports = function(context, options) {
  return {
    name: 'vitessce-docusaurus-plugin',
    configureWebpack(config, isServer, utils) {
      return {
        mergeStrategy: {
          'module.rules': 'prepend',
        },
        module: {
          rules: [
            // First, run the linter.
            // It's important to do this before Babel processes the JS.
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              enforce: 'pre',
              use: [
                {
                  options: {
                    cache: true,
                    formatter: 'stylish',
                    eslintPath: require.resolve('eslint'),
                    resolvePluginsRelativeTo: __dirname,
                  },
                  loader: require.resolve('eslint-loader'),
                },
              ],
              include: SRC_DIR,
            },
            // For the ESM build of vitessce, we need to allow imports both with and without the .js suffix
            {
              test: /\.m?js/,
              resolve: {
                fullySpecified: false
              }
            }
          ]
        },
      };
    },
  };
};