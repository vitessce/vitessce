/*
 * This file has been ejected from create-react-app v3.4.0.
 * The original file was located at `config/paths.js` but has now
 * been heavily modified and moved here.
 */
const fromEntries = require('object.fromentries');
const utils = require('./utils');
const resolveApp = utils.resolveApp;
const resolveModule = utils.resolveModule;

const componentsToExport = [
    'cell-tooltip',
    'channels',
    'factors',
    'genes',
    'heatmap',
    'scatterplot',
    'sets',
    'sourcepublisher',
    'spatial',
    'status',
];

module.exports = {
    appPackageJson: resolveApp('package.json'),
    appPath: resolveApp('.'),
    appBuild: resolveApp('build-demo'),
    appPublic: resolveApp('demo'),
    appHtml: resolveApp('demo/index.html'),
    appIndexJs: resolveModule(resolveApp, 'src/demo/index'),
    appSrc: resolveApp('src'),
    appJsConfig: resolveApp('jsconfig.json'),
    appNodeModules: resolveApp('node_modules'),
    libBuild: resolveApp('build-lib'),
    libIndexJs: resolveModule(resolveApp, 'src/index'),
    libOtherJs: fromEntries(componentsToExport.map(name => [
        name,
        resolveModule(resolveApp, `src/components/${name}/index`)
    ]))
};