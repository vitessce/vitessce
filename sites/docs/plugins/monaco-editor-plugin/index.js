const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

// We need to make a custom Docusaurus plugin to be able to configure webpack
// for the react-monaco-editor component.
// Reference: https://v2.docusaurus.io/docs/using-plugins#creating-plugins
// Reference: https://v2.docusaurus.io/docs/lifecycle-apis#configurewebpackconfig-isserver-utils
// Reference: https://github.com/react-monaco-editor/react-monaco-editor#using-with-webpack
module.exports = function(context, options) {
  return {
    name: 'monaco-editor-docusaurus-plugin',
    configureWebpack(config, isServer, utils) {
      return {
        plugins: (!isServer ? [
          new MonacoWebpackPlugin({
            languages: ['json', 'javascript']
          })
        ] : []),
      };
    },
  };
};
