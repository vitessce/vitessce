#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parse, query, edit } from '@ast-grep/napi';

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
  
  const sgNode = parse(constantsContent);
  
  // Find the ViewType object
  const viewTypeNode = query(sgNode, `
    export const ViewType = {
      $$$
    }
  `).matches[0];

  if (!viewTypeNode) {
    throw new Error('Could not find ViewType object in constants.ts');
  }

  // Add the new view type
  const newContent = edit(constantsContent, [{
    range: viewTypeNode.range,
    text: `export const ViewType = {
      ${viewTypeNode.text.slice(1, -1)},
      ${toConstantCase(viewName)}: '${toCamelCase(viewName)}'
    }`,
  }]);

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
  
  const sgNode = parse(coordinationContent);
  
  // Find the COMPONENT_COORDINATION_TYPES object
  const coordTypesNode = query(sgNode, `
    export const COMPONENT_COORDINATION_TYPES = {
      $$$
    }
  `).matches[0];

  if (!coordTypesNode) {
    throw new Error('Could not find COMPONENT_COORDINATION_TYPES in coordination.ts');
  }

  let coordinationTypes;
  if (existingView) {
    // Find the existing view's coordination types
    const existingViewNode = query(sgNode, `
      [ViewType.${toConstantCase(existingView)}]: [$$$]
    `).matches[0];

    if (!existingViewNode) {
      throw new Error(`Could not find coordination types for ${existingView}`);
    }
    coordinationTypes = existingViewNode.text;
  } else {
    coordinationTypes = 'CoordinationType.DATASET';
  }

  // Add the new view's coordination types
  const newContent = edit(coordinationContent, [{
    range: coordTypesNode.range,
    text: `export const COMPONENT_COORDINATION_TYPES = {
      ${coordTypesNode.text.slice(1, -1)},
      [ViewType.${toConstantCase(viewName)}]: [
        ${coordinationTypes}
      ]
    }`,
  }]);

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
  
  const sgNode = parse(pluginContent);
  
  // Find the last import statement
  const importNodes = query(sgNode, 'import { $$$ } from "@vitessce/$$$"').matches;
  const lastImport = importNodes[importNodes.length - 1];

  // Add the new import
  const importStatement = `import { ${toPascalCase(viewName)}Subscriber } from '@vitessce/${viewName}';`;
  
  // Find the basePlugins array
  const basePluginsNode = query(sgNode, `
    const basePlugins = [
      $$$
    ]
  `).matches[0];

  if (!basePluginsNode) {
    throw new Error('Could not find basePlugins array');
  }

  // Add the new view type registration
  const viewTypeRegistration = `makeViewType(ViewType.${toConstantCase(viewName)}, ${toPascalCase(viewName)}Subscriber)`;

  const newContent = edit(pluginContent, [
    {
      // Add import after last import
      range: { start: lastImport.range.end + 1, end: lastImport.range.end + 1 },
      text: importStatement + '\n',
    },
    {
      // Add view type registration at end of basePlugins array
      range: basePluginsNode.range,
      text: `const basePlugins = [
        ${basePluginsNode.text.slice(1, -1)},
        ${viewTypeRegistration}
      ]`,
    },
  ]);

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
    "type": "module",
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
  useDescription,
  useImageData,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import ${toPascalCase(viewName)} from './${toPascalCase(viewName)}.js';

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
  }, {
    setDataset,
  }] = useCoordination(
   COMPONENT_COORDINATION_TYPES[ViewType.${toConstantCase(viewName)}],
   coordinationScopes,
  );

  // Get data from loaders using the data hooks.
  const [description] = useDescription(loaders, dataset);

  const isReady = useReady([

  ]);

  return (
     <TitleInfo
      title={title}
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
  
  console.log('\nNext steps:');
  console.log('1. Implement the view component in packages/view-types/' + viewName + '/src/' + toPascalCase(viewName) + 'Subscriber.js');
  console.log('2. Add any necessary dependencies to packages/view-types/' + viewName + '/package.json');
  console.log('3. Create a view config example in examples/configs/src/view-configs/');
  console.log('4. Run `npm install` to update dependencies');
}

main(); 