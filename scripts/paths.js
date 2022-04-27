/*
 * This file has been ejected from create-react-app v3.4.0.
 * The original file was located at `config/paths.js` but has now
 * been heavily modified and moved here.
 */
const utils = require('./utils');
const resolveApp = utils.resolveApp;
const resolveModule = utils.resolveModule;

module.exports = {
    appPackageJson: resolveApp('package.json'),
    appPath: resolveApp('.'),
    appBuild: resolveApp('dist-demo'),
    appPublic: resolveApp('demo'),
    appHtml: resolveApp('demo/index.html'),
    appIndexJs: resolveModule(resolveApp, 'src/demo/index'),
    appSrc: resolveApp('src'),
    appNodeModules: resolveApp('node_modules'),
    libBuild: resolveApp('dist'),
    libIndexJs: resolveModule(resolveApp, 'src/index'),
    libOtherJs: {
        v1: resolveModule(resolveApp, `src/view-configs/api/v1/index`),
        v2: resolveModule(resolveApp, `src/view-configs/api/v2/index`),
    },
};