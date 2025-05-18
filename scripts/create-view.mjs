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

import {
  createDirectory,
  createFile,
  formatCode,
  toPascalCase,
  toCamelCase,
  toConstantCase,
} from './create-view-utils.mjs';
import {
  generatePackageJson,
  generateTsConfig,
  generateVitestConfig,
  generateViewComponent,
  generateSubscriberComponent,
  generateIndexFile,
  generateExampleConfig,
} from './create-view-template-functions.mjs';



/**
 * Updates the tsconfig.json file to include a reference to the new view package.
 * The new reference is positioned after the last existing view-types reference.
 * @param {string} viewName The name of the new view to add to the tsconfig
 */
function updateTsConfig(viewName) {
  const tsConfigPath = path.resolve(process.cwd(), 'tsconfig.json');
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  
  const finalViewTypesReferenceIndex = tsConfig.references
    .findLastIndex(ref => ref.path.includes('packages/view-types/'));
  tsConfig.references.splice(finalViewTypesReferenceIndex + 1, 0, {
    path: `packages/view-types/${viewName}`
  });
  
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
 */
function updateCoordination(viewName) {
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

  const coordinationTypes = `CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_SELECTION`;

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
  const packageJson = generatePackageJson({ viewName, version, author, license });
  createFile(`${packageDir}/package.json`, JSON.stringify(packageJson, null, 2));

  // Create tsconfig.json
  const tsconfig = generateTsConfig();
  createFile(`${packageDir}/tsconfig.json`, JSON.stringify(tsconfig, null, 2));

  // Create vitest.config.ts
  const vitestConfig = generateVitestConfig();
  createFile(`${packageDir}/vitest.config.ts`, vitestConfig);

  // Create child component
  const childContent = generateViewComponent(viewName);
  createFile(`${packageDir}/src/${toPascalCase(viewName)}.js`, childContent);

  // Create parent component
  const subscriberContent = generateSubscriberComponent(viewName);
  createFile(`${packageDir}/src/${toPascalCase(viewName)}Subscriber.js`, subscriberContent);

  // Create index.js
  const indexContent = generateIndexFile(viewName);
  createFile(`${packageDir}/src/index.js`, indexContent);
}

/**
 * Creates an example configuration file for the new view
 * @param {string} viewName The hyphen-separated name of the new view to create
 */
function createExampleConfig(viewName) {
  const configDefinitionContent = generateExampleConfig(viewName);
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
  
  if (!viewName) {
    console.error('Please provide a view name (in kebab-case)');
    console.error('Usage: node create-view.mjs <view-name> [existing-view-to-copy]');
    process.exit(1);
  }
  
  if (!/^[a-z][a-z0-9-]*$/.test(viewName)) {
    console.error('View name must be in kebab-case (e.g., my-new-view)');
    process.exit(1);
  }


  console.log(`Creating new view: ${viewName}`);
  
  createViewPackage(viewName);
  updateTsConfig(viewName);
  updateConstants(viewName);
  updateBasePluginsInMainPackage(viewName);
  updateCoordination(viewName);

  createExampleConfig(viewName);
  
  console.log('\nNext steps:');
  console.log('1. Run `pnpm install` to update the internal monorepo dependencies.');
  console.log('2. Run `pnpm run start-demo` to start the development server.');
  console.log(`3. Open browser to http://localhost:3000/?dataset=${viewName}-example`);
  console.log('4. Implement the view component in packages/view-types/' + viewName + '/src/' + toPascalCase(viewName) + 'Subscriber.js');
  console.log('5. Run `pnpm lint-fix` and check for linting messages.');
}

main(); 