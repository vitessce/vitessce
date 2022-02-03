/* eslint-disable camelcase */
import uuidv4 from 'uuid/v4';
import cloneDeep from 'lodash/cloneDeep';
import { getNextScope, capitalize } from '../utils';
import {
  COMPONENT_COORDINATION_TYPES,
} from './state/coordination';

/**
 * A helper function for the `upgrade()` function,
 * which helps convert `props.view` (for scatterplot and spatial),
 * into new coordination scopes, setting their values
 * in the coordination space and returning the new scope mappings.
 * This function does mutate the `coordinationSpace` parameter.
 * @param {string} prefix The coordination type prefix,
 * either 'embedding' or 'spatial'.
 * @param {object} view The view prop object containing
 * the properties `.target` and `.zoom`.
 * @param {object} coordinationSpace The coordination space.
 * @returns {object} The new coordination scope names.
 */
function upgradeReplaceViewProp(prefix, view, coordinationSpace) {
  const prevZScopes = Object.keys(coordinationSpace[`${prefix}Zoom`]);
  const prevTXScopes = Object.keys(coordinationSpace[`${prefix}TargetX`]);
  const prevTYScopes = Object.keys(coordinationSpace[`${prefix}TargetY`]);

  const nextZScope = getNextScope(prevZScopes);
  const nextTXScope = getNextScope(prevTXScopes);
  const nextTYScope = getNextScope(prevTYScopes);

  const { zoom, target: [targetX, targetY] } = view;
  // eslint-disable-next-line no-param-reassign
  coordinationSpace[`${prefix}Zoom`][nextZScope] = zoom;
  // eslint-disable-next-line no-param-reassign
  coordinationSpace[`${prefix}TargetX`][nextTXScope] = targetX;
  // eslint-disable-next-line no-param-reassign
  coordinationSpace[`${prefix}TargetY`][nextTYScope] = targetY;
  return {
    [`${prefix}Zoom`]: nextZScope,
    [`${prefix}TargetX`]: nextTXScope,
    [`${prefix}TargetY`]: nextTYScope,
  };
}

/**
 * Convert an older view config to a newer view config.
 * @param {object} config A v0.1.0 "legacy" view config.
 * @returns {object} A v1.0.0 "upgraded" view config.
 */
export function upgradeFrom0_1_0(config, datasetUid = null) {
  const coordinationSpace = {
    embeddingType: {},
    embeddingZoom: {},
    embeddingTargetX: {},
    embeddingTargetY: {},
    spatialZoom: {},
    spatialTargetX: {},
    spatialTargetY: {},
  };

  const layout = [];
  config.staticLayout.forEach((componentDef) => {
    let newComponentDef = {
      ...componentDef,
      coordinationScopes: {},
    };
    if (componentDef.component === 'scatterplot') {
      // Need to set up the coordinationSpace
      // with embeddingType to replace scatterplot
      // component prop "mapping".
      if (componentDef.props.mapping) {
        coordinationSpace.embeddingType[componentDef.props.mapping] = componentDef.props.mapping;
        newComponentDef = {
          ...newComponentDef,
          coordinationScopes: {
            ...newComponentDef.coordinationScopes,
            embeddingType: componentDef.props.mapping,
          },
        };
      }
      // Need to set up the coordinationSpace
      // with embeddingZoom / embeddingTargetX/Y to replace scatterplot
      // component prop "view" ({ zoom, target }).
      if (componentDef.props.view) {
        // Note that the below function does mutate the coordinationSpace param.
        const newScopeValues = upgradeReplaceViewProp(
          'embedding', componentDef.props.view, coordinationSpace,
        );
        newComponentDef = {
          ...newComponentDef,
          coordinationScopes: {
            ...newComponentDef.coordinationScopes,
            ...newScopeValues,
          },
        };
      }
    }
    if (componentDef.component === 'spatial') {
      // Need to set up the coordinationSpace
      // with spatialZoom / spatialTargetX/Y to replace spatial
      // component prop "view" ({ zoom, target }).
      if (componentDef?.props?.view) {
        // Note that the below function does mutate the coordinationSpace param.
        const newScopeValues = upgradeReplaceViewProp(
          'spatial', componentDef.props.view, coordinationSpace,
        );
        newComponentDef = {
          ...newComponentDef,
          coordinationScopes: {
            ...newComponentDef.coordinationScopes,
            ...newScopeValues,
          },
        };
      }
    }
    layout.push(newComponentDef);
  });

  // Use a random dataset ID when initializing automatically,
  // so that it changes with each new v0.1.0 view config.
  // However, check if the `datasetUid` parameter was passed,
  // which allows for unit testing.
  const newDatasetUid = datasetUid || uuidv4();

  return {
    version: '1.0.1',
    name: config.name,
    description: config.description,
    public: config.public,
    datasets: [
      {
        uid: newDatasetUid,
        name: newDatasetUid,
        files: config.layers.map(layer => ({
          type: layer.type.toLowerCase(),
          fileType: layer.fileType,
          url: layer.url,
        })),
      },
    ],
    initStrategy: 'auto',
    coordinationSpace,
    layout,
  };
}

export function upgradeFrom1_0_0(config) {
  const coordinationSpace = { ...config.coordinationSpace };

  function replaceLayerType(layerType) {
    // Layer type could be one of a few things, bitmask or raster at the moment.
    const isRaster = layerType === 'raster';
    coordinationSpace[`spatial${capitalize(layerType)}Layer${isRaster ? 's' : ''}`] = {};
    Object.entries(coordinationSpace.spatialLayers).forEach(([scope, layers]) => {
      if (Array.isArray(layers) && layers.find(layer => layer.type === layerType)) {
        const typedLayers = layers
          .filter(layer => layer.type === layerType)
          .map((layer) => {
            const newLayer = { ...layer };
            delete newLayer.type;
            return newLayer;
          });
        coordinationSpace[`spatial${capitalize(layerType)}Layer${isRaster ? 's' : ''}`][scope] = isRaster ? typedLayers : typedLayers[0];
      } else {
        coordinationSpace[`spatial${capitalize(layerType)}Layer${isRaster ? 's' : ''}`][scope] = null;
      }
    });
  }

  if (coordinationSpace.spatialLayers) {
    replaceLayerType('raster');
    replaceLayerType('cells');
    replaceLayerType('molecules');
    replaceLayerType('neighborhoods');
    delete coordinationSpace.spatialLayers;
  }

  const layout = config.layout.map((component) => {
    const newComponent = { ...component };

    function replaceCoordinationScope(layerType) {
      const isRaster = layerType === 'raster';
      if (COMPONENT_COORDINATION_TYPES[newComponent.component].includes(`spatial${capitalize(layerType)}Layer${isRaster ? 's' : ''}`)) {
        newComponent.coordinationScopes[`spatial${capitalize(layerType)}Layer${isRaster ? 's' : ''}`] = newComponent.coordinationScopes.spatialLayers;
      }
    }

    if (newComponent.coordinationScopes && newComponent.coordinationScopes.spatialLayers) {
      replaceCoordinationScope('raster');
      replaceCoordinationScope('cells');
      replaceCoordinationScope('molecules');
      replaceCoordinationScope('neighborhoods');
      delete newComponent.coordinationScopes.spatialLayers;
    }
    return newComponent;
  });

  return {
    ...config,
    coordinationSpace,
    layout,
    version: '1.0.1',
  };
}


export function upgradeFrom1_0_1(config) {
  // Need to add the globalDisable3d prop to any layer controller views,
  // to match the previous lack of 3D auto-detection behavior.

  const layout = config.layout.map((component) => {
    const newComponent = { ...component };
    if (newComponent.component === 'layerController') {
      newComponent.props = {
        ...newComponent.props,
        globalDisable3d: true,
      };
    }
    return newComponent;
  });

  // Enforce bitmask or raster as spatial raster layer type, defaulting
  // to raster layer if it is not one of bitmask or raster from the old config.

  const newConfig = cloneDeep(config);
  Object.keys((newConfig?.coordinationSpace?.spatialRasterLayers || {})).forEach((key) => {
    if (newConfig.coordinationSpace.spatialRasterLayers[key]) {
      newConfig.coordinationSpace.spatialRasterLayers[key].forEach((layer, index) => {
        newConfig.coordinationSpace.spatialRasterLayers[key][index].type = ['bitmask', 'raster'].includes(layer.type) ? layer.type : 'raster';
      });
    }
  });

  return {
    ...newConfig,
    layout,
    version: '1.0.2',
  };
}

export function upgradeFrom1_0_2(config) {
  // Need to add the globalDisable3d prop to any layer controller views,
  // to match the previous lack of 3D auto-detection behavior.

  const layout = config.layout.map((component) => {
    const newComponent = { ...component };
    if (newComponent.component === 'layerController') {
      newComponent.props = {
        ...newComponent.props,
        disableChannelsIfRgbDetected: true,
      };
    }
    return newComponent;
  });

  // Enforce bitmask or raster as spatial raster layer type, defaulting
  // to raster layer if it is not one of bitmask or raster from the old config.

  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    layout,
    version: '1.0.3',
  };
}

export function upgradeFrom1_0_3(config) {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.4',
  };
}

// Added in version 1.0.5:
// - Support for an array of strings in the setName property within options array items
//   for the anndata-cell-sets.zarr file type.
export function upgradeFrom1_0_4(config) {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.5',
  };
}


// Added in version 1.0.6:
// - Support for the scoreName property within options array items
//   for the anndata-cell-sets.zarr file type.
export function upgradeFrom1_0_5(config) {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.6',
  };
}

// Added in version next:
// - moleculeSelection
// - use3d property for spatialMoleculesLayer object
export function upgradeFrom1_0_6(config) {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: 'next',
  };
}
