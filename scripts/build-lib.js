/*
 * This file has been ejected from create-react-app v3.4.0.
 * Note: the file has been renamed from `build.js` to `build-lib.js`.
 * It has been heavily modified, with most code moved to `utils.js` or removed.
 */

'use strict';

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Ensure environment variables are read.
require('../config/env');

const configFactory = require('../config/webpack.config');
const paths = require('../config/paths');
const utils = require('./utils');

utils.scriptInit();

// Generate configuration
const targets = [ 'umd', 'es' ];

function buildForTarget(i) {
    if(i < targets.length) {
        const target = targets[i];
        const config = configFactory(process.env.NODE_ENV, target);
        utils.build(config, paths, target)
            .then(() => {
                // recursion
                buildForTarget(i+1);
            })
    }
}

function buildForAllTargets() {
    buildForTarget(0);
}

// Build for all targets.
buildForAllTargets();

