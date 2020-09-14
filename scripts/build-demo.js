/*
 * This file has been ejected from create-react-app v3.4.0.
 * Note: the file has been renamed from `build.js` to `build-lib.js`.
 * It has been heavily modified, with most code moved to `utils.js` or removed.
 */

'use strict';

const fs = require('fs');
const utils = require('./utils');
const paths = require('./paths');
const configFactory = require('./webpack.config-demo');

utils.scriptInit();

const target = 'demo';
const environment = process.argv[2];
// Build demo output files.
(async () => {
    const config = configFactory(paths, environment);
    await utils.build(config, paths, environment, target);
})();
