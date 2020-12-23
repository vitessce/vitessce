const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');

const webpackCommon = require('./webpack.config-common');
const getClientEnvironment = webpackCommon.getClientEnvironment;
const getAdditionalModulePaths = webpackCommon.getAdditionalModulePaths;
const getWebpackAliases = webpackCommon.getWebpackAliases;
const getDevtoolModuleFilenameTemplate = webpackCommon.getDevtoolModuleFilenameTemplate;
const getOptimizationMinimizer = webpackCommon.getOptimizationMinimizer;

const getDevtoolInfo = webpackCommon.getDevtoolInfo;
const getResolveInfo = webpackCommon.getResolveInfo;
const getResolveLoaderInfo = webpackCommon.getResolveLoaderInfo;
const getModuleInfo = webpackCommon.getModuleInfo;
const getNodeInfo = webpackCommon.getNodeInfo;
const getPerformanceInfo = webpackCommon.getPerformanceInfo;

// Constants
const shouldDoProfiling = false;
const shouldUseSourceMap = true; // Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldInlineRuntimeChunk = true; // Some apps do not need the benefits of saving a web request, so not inlining the chunk makes for a smoother build process.
const useTypeScript = false;

/**
 * The webpack config factory for the demo target.
 * {object} paths Paths object (such as the one exported from ./paths)
 * {string} environment One of "development", "production"
 */
module.exports = function(paths, environment) {
    process.env.BABEL_ENV = environment;
    process.env.PUBLIC_URL = '';

    const isEnvProduction = environment === 'production';
    const isEnvDevelopment = !isEnvProduction;

    const appPackageJson = require(paths.appPackageJson);
    const publicUrlOrPath = getPublicUrlOrPath(isEnvDevelopment, ".", process.env.PUBLIC_URL);
    const clientEnv = getClientEnvironment(environment, publicUrlOrPath.slice(0, -1));
    const additionalModulePaths = getAdditionalModulePaths(paths);
    const webpackAliases = getWebpackAliases(paths);
    const devtoolModuleFilenameTemplate = getDevtoolModuleFilenameTemplate(paths, environment);
    const optimizationMinimizer = getOptimizationMinimizer(shouldDoProfiling, shouldUseSourceMap);
    
    const devtoolInfo = getDevtoolInfo(environment, shouldUseSourceMap);
    const resolveInfo = getResolveInfo(paths, additionalModulePaths, useTypeScript, shouldDoProfiling, webpackAliases);
    const resolveLoaderInfo = getResolveLoaderInfo();
    const moduleInfo = getModuleInfo(paths, environment, publicUrlOrPath, shouldUseSourceMap);
    const nodeInfo = getNodeInfo();
    const performanceInfo = getPerformanceInfo();

    return {
        mode: environment,
        bail: isEnvProduction,
        devtool: devtoolInfo,
        entry: [
            // Include an alternative client for WebpackDevServer. A client's job is to
            // connect to WebpackDevServer by a socket and get notified about changes.
            // When you save a file, the client will either apply hot updates (in case
            // of CSS changes), or refresh the page (in case of JS changes). When you
            // make a syntax error, this client will display a syntax error overlay.
            // Note: instead of the default WebpackDevServer client, we use a custom one
            // to bring better experience for Create React App users. You can replace
            // the line below with these two lines if you prefer the stock client:
            // require.resolve('webpack-dev-server/client') + '?/',
            // require.resolve('webpack/hot/dev-server'),
            ...(isEnvDevelopment ? [ require.resolve('webpack-dev-server/client') ] : []),
            // Finally, this is your app's code:
            paths.appIndexJs,
        ],
        output: {
            // The build folder.
            path: paths.appBuild,
            // Add /* filename */ comments to generated require()s in the output.
            pathinfo: isEnvDevelopment,
            // There will be one main bundle, and one file per asynchronous chunk.
            // In development, it does not produce real files.
            filename: 'static/js/[name].[contenthash:8].js',
            // Webpack uses `publicPath` to determine where the app is being served from.
            // It requires a trailing slash, or the file assets will get an incorrect path.
            publicPath: publicUrlOrPath,
            // Point sourcemap entries to original disk location (format as URL on Windows)
            devtoolModuleFilenameTemplate: devtoolModuleFilenameTemplate,
            // this defaults to 'window', but by setting it to 'this' then
            // module chunks which are built will work in web workers as well.
            globalObject: 'this',
            // There are also additional JS chunk files if you use code splitting.
            chunkFilename: (isEnvProduction
                ? 'static/js/[name].[contenthash:8].chunk.js'
                : 'static/js/[name].chunk.js'),
        },
        optimization: {
            minimize: isEnvProduction,
            minimizer: optimizationMinimizer,
            // Note: the following two properties `splitChunks` and `runtimeChunk` are only for the demo target.
            // Automatically split vendor and commons
            // https://twitter.com/wSokra/status/969633336732905474
            // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
            splitChunks: {
                chunks: 'all',
                name: false,
            },
            // Keep the runtime chunk separated to enable long term caching
            // https://twitter.com/wSokra/status/969679223278505985
            // https://github.com/facebook/create-react-app/issues/5358
            runtimeChunk: {
                name: entrypoint => `runtime-${entrypoint.name}`,
            },
        },
        resolve: resolveInfo,
        resolveLoader: resolveLoaderInfo,
        module: moduleInfo,
        plugins: [
            new webpack.ProgressPlugin(),
            // Generates an `index.html` file with the <script> injected.
            new HtmlWebpackPlugin(
                Object.assign(
                    {},
                    {
                        inject: true,
                        template: paths.appHtml,
                    },
                    (isEnvProduction
                    ? {
                        minify: {
                            removeComments: true,
                            collapseWhitespace: true,
                            removeRedundantAttributes: true,
                            useShortDoctype: true,
                            removeEmptyAttributes: true,
                            removeStyleLinkTypeAttributes: true,
                            keepClosingSlash: true,
                            minifyJS: true,
                            minifyCSS: true,
                            minifyURLs: true,
                        },
                    } : undefined)
                )
            ),
            // Inlines the webpack runtime script. This script is too small to warrant
            // a network request.
            // https://github.com/facebook/create-react-app/issues/5358
            ...((isEnvProduction && shouldInlineRuntimeChunk) ? [ 
                new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]) 
            ] : []),
            // Makes some environment variables available in index.html.
            // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
            // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
            // It will be an empty string unless you specify "homepage"
            // in `package.json`, in which case it will be the pathname of that URL.
            new InterpolateHtmlPlugin(HtmlWebpackPlugin, clientEnv.raw),
            // This gives some necessary context to module not found errors, such as
            // the requesting resource.
            new ModuleNotFoundPlugin(paths.appPath),
            // Makes some environment variables available to the JS code, for example:
            // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
            // It is absolutely essential that NODE_ENV is set to production
            // during a production build.
            // Otherwise React will be compiled in the very slow development mode.
            new webpack.DefinePlugin(clientEnv.stringified),
            // This is necessary to emit hot updates (currently CSS only):
            ...(isEnvDevelopment ? [ new webpack.HotModuleReplacementPlugin() ] : []),
            // Watcher doesn't work well if you mistype casing in a path so we use
            // a plugin that prints an error when you attempt to do this.
            // See https://github.com/facebook/create-react-app/issues/240
            ...(isEnvDevelopment ? [ new CaseSensitivePathsPlugin() ] : []),
            // If you require a missing module and then `npm install` it, you still have
            // to restart the development server for webpack to discover it. This plugin
            // makes the discovery automatic so you don't have to restart.
            // See https://github.com/facebook/create-react-app/issues/186
            ...(isEnvDevelopment ? [ new WatchMissingNodeModulesPlugin(paths.appNodeModules) ] : []),
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: 'static/css/[name].css',
                chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),
        ].filter(Boolean),
        externals: {
            // No externals, demo should come with everything.
        },
        node: false,
        performance: performanceInfo,
    };
};