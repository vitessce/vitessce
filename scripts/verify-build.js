const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const constants = require('./constants');

const LIB_ENVIRONMENTS = ['production'];
const LIB_TARGETS = constants.LIB_TARGETS;

// Construct an array of expected file paths.
let expectedLibFiles = [];
for(let environment of LIB_ENVIRONMENTS) {
    for (let target of LIB_TARGETS) {
        const extension = (environment === 'production' && target !== 'es' ? 'min.js' : 'js')
        // Construct path to index.js and index.css files.
        const indexJs = path.join(paths.libBuild, target, environment, `index.${extension}`);
        const indexCss = path.join(paths.libBuild, target, environment, 'index.css');
        expectedLibFiles.push(indexJs);
        expectedLibFiles.push(indexCss);
    }
}

// Check that all expected files exist. Fail if not.
for(let expectedLibFile of expectedLibFiles) {
    if(!fs.existsSync(expectedLibFile)) {
        console.log(`Expected a build file that does not exist, ${expectedLibFile}`);
        process.exit(1);
    }
}
