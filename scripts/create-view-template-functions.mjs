// String/JSON template functions for the create-view script.
import {
  toPascalCase,
  toCamelCase,
  toConstantCase,
} from './create-view-utils.mjs';


/**
 * Generates the package.json content for a new view package
 * @param {object} params Parameters for generating package.json
 * @param {string} params.viewName The hyphen-separated name of the view
 * @param {string} params.version Version from main package
 * @param {string} params.author Author from main package
 * @param {string} params.license License from main package
 * @param {string} params.homepage Homepage from main package
 * @param {object} params.repository Repository from main package
 * @returns {object} The package.json content as an object
 */
export function generatePackageJson({ viewName, version, author, license, homepage, repository }) {
  return {
    "name": `@vitessce/${viewName}`,
    "version": version,
    "author": author,
    "license": license,
    "homepage": homepage,
    "repository": repository,
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
      "@vitessce/styles": "workspace:*",
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
      "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
    }
  };
}

/**
 * Generates the tsconfig.json content for a new view package
 * @returns {object} The tsconfig.json content as an object
 */
export function generateTsConfig() {
  return {
    "extends": "../../../tsconfig.json",
    "compilerOptions": {
      "composite": true,
      "outDir": "dist-tsc",
      "rootDir": "src"
    },
    "include": ["src"]
  };
}

/**
 * Generates the vitest.config.ts content
 * @returns {string} The vitest.config.ts content
 */
export function generateVitestConfig() {
  return `import configShared from '../../../vite.config.js';

export default configShared;
`;
}

/**
 * Generates the content for the main view component
 * @param {string} viewName The hyphen-separated name of the view
 * @returns {string} The component content
 */
export function generateViewComponent(viewName) {
  const pascalName = toPascalCase(viewName);
  return `import React from 'react';

export function ${pascalName}(props) {
  return (
      <p>TODO: Implement ${pascalName} view</p>
  );
}`;
}

/**
 * Generates the content for the subscriber component
 * @param {string} viewName The hyphen-separated name of the view
 * @returns {string} The subscriber component content
 */
export function generateSubscriberComponent(viewName) {
  const pascalName = toPascalCase(viewName);
  const constantName = toConstantCase(viewName);
  return `import React from 'react';
import {
  TitleInfo,
  useReady,
  useCoordination,
  useLoaders,
  useObsFeatureMatrixIndices,
  useCoordinationScopes,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { ${pascalName} } from './${pascalName}.js';

export function ${pascalName}Subscriber(props) {
  const {
    coordinationScopes: coordinationScopesRaw,
    removeGridComponent,
    theme,
    title = '${pascalName}',
    closeButtonVisible,
    helpText = ViewHelpMapping.${constantName},
  } = props;

  const loaders = useLoaders();
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureSelection,
  }, {
    setFeatureSelection,
  }] = useCoordination(
   COMPONENT_COORDINATION_TYPES[ViewType.${constantName}],
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
      <${pascalName} />
    </TitleInfo>
  );
}`;
}

/**
 * Generates the content for the index.js file
 * @param {string} viewName The hyphen-separated name of the view
 * @returns {string} The index.js content
 */
export function generateIndexFile(viewName) {
  const pascalName = toPascalCase(viewName);
  return `export { ${pascalName}Subscriber } from './${pascalName}Subscriber.js';`;
}

/**
 * Generates the content for the example config file
 * @param {string} viewName The hyphen-separated name of the view
 * @returns {string} The example config content
 */
export function generateExampleConfig(viewName) {
  const camelName = toCamelCase(viewName);
  return `/* eslint-disable max-len */
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
  const ${camelName} = vc.addView(dataset, '${camelName}');

  vc.linkViewsByObject([scatterplot], {
    'embeddingType': 'UMAP',
  }, { meta: false });

  vc.layout(hconcat(scatterplot, ${camelName}));

  const configJSON = vc.toJSON();
  return configJSON;
}

export const ${camelName}Example = generateConfig();
`;
}
