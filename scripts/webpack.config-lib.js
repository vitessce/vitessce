const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
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
 * The webpack config factory for library target(s).
 * {object} paths Paths object (such as the one exported from ./paths)
 * {string} environment One of "development", "production"
 * {string} target One of "es", "umd"
 */
module.exports = function(paths, environment, target) {
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
        entry: {
            index: paths.libIndexJs,
            ...paths.libOtherJs
        },
        output: {
            // The build folder.
            path: path.join(paths.libBuild, target, environment),
            // We want there to be separate files, one for each entry file.
            filename: (isEnvProduction ? "[name].min.js" : "[name].js"),
            library: [ appPackageJson.name, "[name]" ],
            libraryTarget: (target === "es" ? "commonjs-module" : target),
            // Add /* filename */ comments to generated require()s in the output.
            pathinfo: isEnvDevelopment,
            // TODO: remove this when upgrading to webpack 5
            futureEmitAssets: true,
            // Webpack uses `publicPath` to determine where the app is being served from.
            // It requires a trailing slash, or the file assets will get an incorrect path.
            publicPath: publicUrlOrPath,
            // Point sourcemap entries to original disk location (format as URL on Windows)
            devtoolModuleFilenameTemplate: devtoolModuleFilenameTemplate,
            // Prevents conflicts when multiple webpack runtimes (from different apps)
            // are used on the same page.
            jsonpFunction: `webpackJsonp${appPackageJson.name}`,
            // this defaults to 'window', but by setting it to 'this' then
            // module chunks which are built will work in web workers as well.
            globalObject: 'this'
        },
        optimization: {
            minimize: isEnvProduction,
            minimizer: optimizationMinimizer,
        },
        resolve: resolveInfo,
        resolveLoader: resolveLoaderInfo,
        module: moduleInfo,
        plugins: [
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
            // Only because this is the library target.
            'React': 'react',
            'ReactDOM': 'react-dom',
        },
        // Some libraries import Node modules but don't use them in the browser.
        // Tell webpack to provide empty mocks for them so importing them works.
        node: nodeInfo,
        // Turn off performance processing because we utilize
        // our own hints via the FileSizeReporter
        performance: performanceInfo,
    };
};