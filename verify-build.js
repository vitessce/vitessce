const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const constants = require('./constants');

const LIB_ENVIRONMENTS = constants.LIB_ENVIRONMENTS;
const LIB_TARGETS = constants.LIB_TARGETS;

// Construct an array of expected file paths.
let expectedLibFiles = [];
for(let environment of LIB_ENVIRONMENTS) {
    const extension = (environment === 'production' ? 'min.js' : 'js')
    for (let target of LIB_TARGETS) {
        // Construct path to index.js and index.css files.
        const indexJs = path.join(paths.libBuild, target, environment, `index.${extension}`);
        const indexCss = path.join(paths.libBuild, target, environment, 'static', 'css', 'index.css');
        expectedLibFiles.push(indexJs);
        expectedLibFiles.push(indexCss);

        // Construct paths to {component_dir}.js files.
        const componentNames = Object.keys(paths.libOtherJs);
        for(let componentName of componentNames) {
            const componentJs = path.join(paths.libBuild, target, environment, `${componentName}.${extension}`);
            expectedLibFiles.push(componentJs);
        }
    }
}

// Check that all expected files exist. Fail if not.
for(let expectedLibFile of expectedLibFiles) {
    if(!fs.existsSync(expectedLibFile)) {
        console.log(`Expected a build file that does not exist, ${expectedLibFile}`);
        process.exit(1);
    }
}
