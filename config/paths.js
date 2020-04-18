/*
 * This file has been ejected from create-react-app v3.4.0.
 * The paths have been modified, and the `libBuild` and `libIndexJs` paths have been added.
 * Rather than using the `homepage` property from `package.json` we now use "." to ensure 
 * that relative paths are used for <script> and <link> tag urls.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');
const utils = require('../scripts/utils');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// https://create-react-app.dev/docs/deployment/#serving-the-same-build-from-different-paths
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  ".",
  process.env.PUBLIC_URL
);

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = utils.moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp('build-demo'),
  appPublic: resolveApp('demo'),
  appHtml: resolveApp('demo/index.html'),
  appIndexJs: resolveModule(resolveApp, 'src/demo/index'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  appNodeModules: resolveApp('node_modules'),
  publicUrlOrPath,
  libBuild: resolveApp('build-lib'),
  libIndexJs: resolveModule(resolveApp, 'src/index')
};