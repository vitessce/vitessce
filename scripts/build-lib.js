/*
 * This file has been ejected from create-react-app v3.4.0.
 * Note: the file has been renamed from `build.js` to `build-lib.js`.
 * It has been heavily modified, with most code moved to `utils.js` or removed.
 */

'use strict';

const utils = require('./utils');
const paths = require('./paths');
const configFactory = require('./webpack.config-lib');

utils.scriptInit();

// Generate configuration
const environments = [ 'production', 'development' ];
const targets = [ 'umd', 'es' ];

async function buildForAll(environments, targets) {
    for(let environment of environments) {
        for (let target of targets) {
            const config = configFactory(paths, environment, target);
            await utils.build(config, paths, environment, target);
        }
    }
}

// Build for all targets.
buildForAll(environments, targets);

