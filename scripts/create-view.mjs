#!/usr/bin/env node

// Purpose: Create a new view within the Vitessce repository.
// This CLI creates a new sub-package for the new view and an example config which includes the new view.
// It also modifies files such as tsconfig and package.json as necessary.
// Finally, it prints next steps.

// Usage:
// node scripts/create-view.mjs line-plot
// # or, to copy the list of coordination types from an existing view:
// node scripts/create-view.mjs line-plot scatterplot

import fs from 'fs';
import path from 'path';
import pkg from '@ast-grep/napi';
const { parse, Lang } = pkg;

/**
 * Converts a hyphen-separated string to PascalCase.
 * Example: "my-string" becomes "MyString"
 * @param {string} str The hyphen-separated input string
 * @returns {string} The PascalCase string
 */
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts a hyphen-separated string to camelCase.
 * Example: "my-string" becomes "myString"
 * @param {string} str The hyphen-separated input string
 * @returns {string} The camelCase string
 */
function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts a hyphen-separated string to CONSTANT_CASE.
 * Example: "my-string" becomes "MY_STRING"
 * @param {string} str The hyphen-separated input string
 * @returns {string} The CONSTANT_CASE string
 */
function toConstantCase(str) {
  return str.toUpperCase().replace(/-/g, '_');
}

/**
 * Creates a directory if it doesn't already exist.
 * Uses recursive creation to create parent directories as needed.
 * @param {string} dir Path to the directory to create
 */
function createDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Replaces lines containing only commas ("\n,\n")
 * by moving the comma onto the previous line (",\n")
 * @param {string} input
 * @returns {string}
 */
function fixCommaLines(input) {
  // Replace full lines with just a comma
  let output = input.replace(/\n,\n/g, ',\n');
  // Handle trailing "\n," at the end of input
  output = output.replace(/\n,$/, ',');
  return output;
}

function fixIndentation(input, numTabs) {
  const numSpaces = numTabs * 2

  const lines = input.split('\n');
  const spaces = ' '.repeat(numSpaces);

  const result = lines.map((line, index) => {
    if (index === 0) return line; // leave the first line unchanged
    return /^\s/.test(line) ? line : spaces + line;
  });

  return result.join('\n');
}

function formatCode(input, numTabs) {
  return fixIndentation(fixCommaLines(input), numTabs);
}

/**
 * Creates a file with the specified content and logs its creation.
 * @param {string} filePath Path where the file should be created
 * @param {string} content Content to write to the file
 */
function createFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  console.log(`Created ${filePath}`);
}

/**
 * Updates the tsconfig.json file to include a reference to the new view package.
 * The new reference is positioned after the last existing view-types reference.
 * @param {string} viewName The name of the new view to add to the tsconfig
 */
function updateTsConfig(viewName) {
  const tsConfigPath = path.resolve(process.cwd(), 'tsconfig.json');
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  
  const finalViewTypesReferenceIndex = tsConfig.references.findIndex(ref => ref.path.includes('packages/view-types/'));
  if (finalViewTypesReferenceIndex !== -1) {
    tsConfig.references.splice(finalViewTypesReferenceIndex + 1, 0, {
      path: `packages/view-types/${viewName}`
    });
  }

  fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
  console.log('Updated tsconfig.json');
}

/**
 * Updates the ViewType enum in constants.ts to include the new view type.
 * The new view type is added with both a CONSTANT_CASE key and camelCase value.
 * For example, if viewName is "my-view", adds:
 * MY_VIEW: 'myView'
 * @param {string} viewName The hyphen-separated name of the new view to add
 */
function updateConstants(viewName) {
  const constantsPath = path.resolve(process.cwd(), 'packages/constants-internal/src/constants.ts');
  const constantsContent = fs.readFileSync(constantsPath, 'utf8');
  
  const sgRoot = parse(Lang.TypeScript, constantsContent).root();
  
  // Find the ViewType object
  const viewTypeNode = sgRoot.find(`
    export const ViewType = {
      $$$KV_PAIRS
    }
  `);

  if (!viewTypeNode) {
    throw new Error('Could not find ViewType object in constants.ts');
  }


  // Find the ViewHelpMapping object
  const viewHelpNode = sgRoot.find(`
    export const ViewHelpMapping = {
      $$$KV_PAIRS
    }
  `);

  if (!viewHelpNode) {
    throw new Error('Could not find ViewHelpMapping object in constants.ts');
  }

  // Add the new view type
  const viewTypeEdit = viewTypeNode.replace(`export const ViewType = {
  ${formatCode(viewTypeNode.getMultipleMatches("KV_PAIRS").map(p => p.text()).join("\n"), 1)}
  ${toConstantCase(viewName)}: '${toCamelCase(viewName)}',
};`);

  // Add the help text
  const viewHelpEdit = viewHelpNode.replace(`export const ViewHelpMapping = {
  ${formatCode(viewHelpNode.getMultipleMatches("KV_PAIRS").map(p => p.text()).join("\n"), 1)}
  ${toConstantCase(viewName)}: 'The ${toCamelCase(viewName)} displays data.',
};`);

  const newContent = sgRoot.commitEdits([viewTypeEdit, viewHelpEdit]);

  fs.writeFileSync(constantsPath, newContent);
  console.log('Updated constants.ts');
}

/**
 * Updates the COMPONENT_COORDINATION_TYPES in coordination.ts to include the new view type.
 * If an existing view is provided, copies its coordination types. Otherwise, uses only DATASET.
 * @param {string} viewName The hyphen-separated name of the new view to add
 * @param {string} [existingView] Optional name of existing view to copy coordination types from
 */
function updateCoordination(viewName, existingView) {
  const coordinationPath = path.resolve(process.cwd(), 'packages/constants-internal/src/coordination.ts');
  const coordinationContent = fs.readFileSync(coordinationPath, 'utf8');
  
  const sgRoot = parse(Lang.TypeScript, coordinationContent).root();
  
  // Find the COMPONENT_COORDINATION_TYPES object
  const coordTypesNode = sgRoot.find(`
    export const COMPONENT_COORDINATION_TYPES = {
      $$$COMPONENT_TO_CT_ARRAY_MAP
    }
  `);

  if (!coordTypesNode) {
    throw new Error('Could not find COMPONENT_COORDINATION_TYPES in coordination.ts');
  }

  let coordinationTypes;
  if (existingView) {
    // Find the existing view's coordination types
    const existingViewNode = sgRoot.find(`
      [ViewType.${toConstantCase(existingView)}]: [
        $$$COORDINATION_TYPES
      ]
    `);

    if (!existingViewNode) {
      throw new Error(`Could not find coordination types for ${existingView}`);
    }
    coordinationTypes = existingViewNode.getMultipleMatches("COORDINATION_TYPES")
      .map(ct => ct.text()).join("");
  } else {
    coordinationTypes = `CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_SELECTION`;
  }

  // Add the new view's coordination types
  const edit = coordTypesNode.replace(`export const COMPONENT_COORDINATION_TYPES = {
  ${formatCode(coordTypesNode.getMultipleMatches("COMPONENT_TO_CT_ARRAY_MAP").map(p => p.text()).join("\n"), 1)}
  [ViewType.${toConstantCase(viewName)}]: [
    ${coordinationTypes},
  ],
};`);
  const newContent = sgRoot.commitEdits([edit]);

  fs.writeFileSync(coordinationPath, newContent);
  console.log('Updated coordination.ts');
}

/**
 * Updates the main plugin to include the new view type.
 * The new view type is added to the base-plugins.ts file.
 * @param {string} viewName The hyphen-separated name of the new view to add
 */
function updateBasePluginsInMainPackage(viewName) {
  const pluginPath = path.resolve(process.cwd(), 'packages/main/all/src/base-plugins.ts');
  const pluginContent = fs.readFileSync(pluginPath, 'utf8');
  
  const sgRoot = parse(Lang.TypeScript, pluginContent).root();
  
  // Find the last import statement
  const importNodes = sgRoot.findAll("import { $$$ } from '$PKG'");
  const lastImport = importNodes.filter(
    node => node.getMatch("PKG").text().startsWith('@vitessce/')
  ).at(-1);

  // Add the new import
  const newImportStatement = `import { ${toPascalCase(viewName)}Subscriber } from '@vitessce/${viewName}';`;
  
  // Find the basePlugins array
  const basePluginsNode = sgRoot.find(`
    export const baseViewTypes = [
      $$$MAKE_VIEWTYPE_CALLS
    ]
  `);

  if (!basePluginsNode) {
    throw new Error('Could not find basePlugins array');
  }

  // Add the new view type registration
  const viewTypeRegistration = `makeViewType(ViewType.${toConstantCase(viewName)}, ${toPascalCase(viewName)}Subscriber)`;

  const importEdit = lastImport.replace(`${lastImport.text()}\n${newImportStatement}`);
  const basePluginsEdit = basePluginsNode.replace(`export const baseViewTypes = [
  ${formatCode(basePluginsNode.getMultipleMatches("MAKE_VIEWTYPE_CALLS").map(c => c.text()).join("\n"), 1)}
  ${viewTypeRegistration},
];`);

  const newContent = sgRoot.commitEdits([importEdit, basePluginsEdit]);

  fs.writeFileSync(pluginPath, newContent);
  console.log('Updated base-plugins.ts');

  // Update the main package.json
  const mainPackageJsonPath = path.resolve(process.cwd(), 'packages/main/all/package.json');
  const mainPackageJson = JSON.parse(fs.readFileSync(mainPackageJsonPath, 'utf8'));
  mainPackageJson.dependencies[`@vitessce/${viewName}`] = 'workspace:*';
  fs.writeFileSync(mainPackageJsonPath, JSON.stringify(mainPackageJson, null, 2));
  console.log('Updated main package.json');
}

/**
 * Creates a new view package directory and files.
 * This directory contains a new sub-package of the monorepo.
 * @param {string} viewName The hyphen-separated name of the new view to create
 */
function createViewPackage(viewName) {
  const packageDir = path.resolve(process.cwd(), `packages/view-types/${viewName}`);
  createDirectory(packageDir);
  createDirectory(`${packageDir}/src`);

  // Read version from packages/main/all/package.json
  const mainPackageJsonPath = path.resolve(process.cwd(), 'packages/main/all/package.json');
  const mainPackageJson = JSON.parse(fs.readFileSync(mainPackageJsonPath, 'utf8'));
  const version = mainPackageJson.version;
  const author = mainPackageJson.author;
  const license = mainPackageJson.license;

  // Create package.json
  const packageJson = {
    "name": `@vitessce/${viewName}`,
    "version": version,
    "author": author,
    "license": license,
    "homepage": "http://vitessce.io",
    "repository": {
      "type": "git",
      "url": "git+https://github.com/vitessce/vitessce.git"
    },
    "license": "MIT",
    "type": "module",
    "main": "dist-tsc/index.js",
    "publishConfig": {
      "main": "dist/index.js",
      "module": "dist/index.js",
      "exports": {
        ".": {
          "types": "./dist-tsc/index.d.ts",
          "import": "./dist/index.js"
        }
      }
    },
    "files": [
      "src",
      "dist",
      "dist-tsc"
    ],
    "scripts": {
      "bundle": "pnpm exec vite build -c ../../../scripts/vite.config.js",
      "test": "pnpm exec vitest --run"
    },
    "dependencies": {
      "@material-ui/core": "catalog:",
      "@vitessce/constants-internal": "workspace:*",
      "@vitessce/utils": "workspace:*",
      "@vitessce/vit-s": "workspace:*",
      "clsx": "catalog:",
      "lodash-es": "catalog:"
    },
    "devDependencies": {
      "@testing-library/jest-dom": "catalog:",
      "@testing-library/react": "catalog:",
      "@testing-library/user-event": "catalog:",
      "react": "catalog:",
      "vite": "catalog:",
      "vitest": "catalog:"
    },
    "peerDependencies": {
      "react": "^16.8.0 || ^17.0.0 || ^18.0.0"
    }
  };
  
  createFile(`${packageDir}/package.json`, JSON.stringify(packageJson, null, 2));

  // Create tsconfig.json
  const tsconfig = {
    "extends": "../../../tsconfig.json",
    "compilerOptions": {
      "composite": true,
      "outDir": "dist-tsc",
      "rootDir": "src"
    },
    "include": ["src"]
  };
  createFile(`${packageDir}/tsconfig.json`, JSON.stringify(tsconfig, null, 2));

  // Create vitest.config.ts
  const vitestConfig = `import configShared from '../../../vite.config.js';

export default configShared;
`;
  createFile(`${packageDir}/vitest.config.ts`, vitestConfig);

  // Create child component
  const childContent = `import React from 'react';

export function ${toPascalCase(viewName)}(props) {
  return (
      <p>TODO: Implement ${toPascalCase(viewName)} view</p>
  );
}`;

  createFile(`${packageDir}/src/${toPascalCase(viewName)}.js`, childContent);

  // Create parent component
  const subscriberContent = `import React from 'react';
import {
  TitleInfo,
  useReady,
  useCoordination,
  useLoaders,
  useObsFeatureMatrixIndices,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { ${toPascalCase(viewName)} } from './${toPascalCase(viewName)}.js';

export function ${toPascalCase(viewName)}Subscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = '${toPascalCase(viewName)}',
    closeButtonVisible,
    helpText = ViewHelpMapping.${toConstantCase(viewName)},
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureSelection,
  }, {
    setFeatureSelection,
  }] = useCoordination(
   COMPONENT_COORDINATION_TYPES[ViewType.${toConstantCase(viewName)}],
   coordinationScopes,
  );

  // Get data from loaders using the data hooks.
  const [{ featureIndex }, matrixIndicesStatus, obsFeatureMatrixUrls] = useObsFeatureMatrixIndices(
    loaders, dataset, true,
    { obsType, featureType },
  );

  const isReady = useReady([
    matrixIndicesStatus,
  ]);

  return (
     <TitleInfo
      title={title}
      info="Some subtitle"
      closeButtonVisible={closeButtonVisible}
      removeGridComponent={removeGridComponent}
      isScroll
      theme={theme}
      isReady={isReady}
      helpText={helpText}
    >
      <${toPascalCase(viewName)} />
    </TitleInfo>
  );
}`;
  createFile(`${packageDir}/src/${toPascalCase(viewName)}Subscriber.js`, subscriberContent);

  // Create index.js
  const indexContent = `export { ${toPascalCase(viewName)}Subscriber } from './${toPascalCase(viewName)}Subscriber.js';`;
  createFile(`${packageDir}/src/index.js`, indexContent);
}

function createExampleConfig(viewName) {
  const configDefinitionContent = `/* eslint-disable max-len */
import {
  VitessceConfig,
  hconcat,
  vconcat,
} from '@vitessce/config';

function generateConfig() {
  const vc = new VitessceConfig({ schemaVersion: '1.0.17', name: 'Demo of ${viewName}' });
  const dataset = vc.addDataset('Habib et al. 2017').addFile({
    fileType: 'anndata.zarr',
    url: 'https://storage.googleapis.com/vitessce-demo-data/habib-2017/habib17.processed.h5ad.zarr',
    coordinationValues: {
      obsType: 'cell',
      featureType: 'gene',
      featureValueType: 'expression',
      embeddingType: 'UMAP',
    },
    options: {
      obsFeatureMatrix: {
        path: 'X',
        initialFeatureFilterPath: 'var/top_highly_variable',
      },
      obsEmbedding: {
        path: 'obsm/X_umap',
      },
      obsSets: [{
        name: 'Cell Type',
        path: 'obs/CellType',
      }],
    },
  });

  const scatterplot = vc.addView(dataset, 'scatterplot');
  const ${toCamelCase(viewName)} = vc.addView(dataset, '${toCamelCase(viewName)}');

  vc.linkViewsByObject([scatterplot], {
    'embeddingType': 'UMAP',
  }, { meta: false });

  vc.layout(hconcat(scatterplot, ${toCamelCase(viewName)}));

  const configJSON = vc.toJSON();
  return configJSON;
}


export const ${toCamelCase(viewName)}Example = generateConfig();
`;
  const examplesDir = path.resolve(process.cwd(), `examples/configs`);
  createFile(`${examplesDir}/src/view-configs/${viewName}.js`, configDefinitionContent);

  // Update examples/configs/src/index.js to
  // 1) import the config JSON and
  // 2) update the `configs` mapping.
  const indexPath = path.resolve(process.cwd(), `${examplesDir}/src/index.js`);
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  const sgRoot = parse(Lang.JavaScript, indexContent).root();
  
  // Find the last import statement
  const importNodes = sgRoot.findAll("import { $$$ } from '$$$'");
  const lastImport = importNodes.at(-1);

  // Add the new import
  const newImportStatement = `import { ${toCamelCase(viewName)}Example } from './view-configs/${viewName}.js';`;
  
  // Find the basePlugins array
  const configsNode = sgRoot.find(`
    export const configs = {
      $$$CONFIG_ID_TO_CONFIG_MAP
    }
  `);

  if (!configsNode) {
    throw new Error('Could not find configs object');
  }

  // Add the new config import and mapping.
  const importEdit = lastImport.replace(`${lastImport.text()}\n${newImportStatement}`);
  const configsEdit = configsNode.replace(`export const configs = {
  ${formatCode(configsNode.getMultipleMatches("CONFIG_ID_TO_CONFIG_MAP").map(p => p.text()).join("\n"), 1)}
  '${viewName}-example': ${toCamelCase(viewName)}Example,
};`);

  const newContent = sgRoot.commitEdits([importEdit, configsEdit]);

  fs.writeFileSync(indexPath, newContent);
  console.log('Updated index.js');

}

/**
 * Main function that orchestrates the creation of a new view.
 * This function validates the view name, creates the view package, updates the necessary files,
 * and provides instructions for the next steps.
 */
function main() {
  const viewName = process.argv[2];
  const existingView = process.argv[3];
  
  if (!viewName) {
    console.error('Please provide a view name (in kebab-case)');
    console.error('Usage: node create-view.mjs <view-name> [existing-view-to-copy]');
    process.exit(1);
  }
  
  if (!/^[a-z][a-z0-9-]*$/.test(viewName)) {
    console.error('View name must be in kebab-case (e.g., my-new-view)');
    process.exit(1);
  }

  if (existingView && !/^[a-z][a-z0-9-]*$/.test(existingView)) {
    console.error('Existing view name must be in kebab-case (e.g., my-existing-view)');
    process.exit(1);
  }
  
  console.log(`Creating new view: ${viewName}${existingView ? ` (copying coordination from ${existingView})` : ''}`);
  
  createViewPackage(viewName);
  updateTsConfig(viewName);
  updateConstants(viewName);
  updateBasePluginsInMainPackage(viewName);
  updateCoordination(viewName, existingView);

  createExampleConfig(viewName);
  
  console.log('\nNext steps:');
  console.log('1. Run `pnpm install` to update the internal monorepo dependencies.');
  console.log('2. Run `pnpm run start-demo` to start the development server.');
  console.log(`3. Open browser to http://localhost:3000/?dataset=${viewName}-example`);
  console.log('4. Implement the view component in packages/view-types/' + viewName + '/src/' + toPascalCase(viewName) + 'Subscriber.js');
  console.log('5. Run `pnpm lint-fix` and check for linting messages.');
}

main(); 