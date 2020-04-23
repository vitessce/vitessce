/*
 * This file has been ejected from create-react-app v3.4.0.
 * Note: the file has been renamed from `build.js` to `build-lib.js`.
 * It has been heavily modified, with most code moved to `utils.js` or removed.
 */

'use strict';

const fs = require('fs-extra');
const utils = require('./utils');
const paths = require('./paths');
const constants = require('./constants');
const configFactory = require('./webpack.config-lib');

utils.scriptInit();

const environments = constants.LIB_ENVIRONMENTS;
const targets = constants.LIB_TARGETS;

// Build library output files.
(async () => {
    for(let environment of environments) {
        for (let target of targets) {
            const config = configFactory(paths, environment, target);
            await utils.build(config, paths, environment, target);
        }
    }
})();
