/* eslint-disable camelcase */
import uuidv4 from 'uuid/v4';
import cloneDeep from 'lodash/cloneDeep';
import { getNextScope, capitalize } from '@vitessce/utils';

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

  const lcDef = layout.find(c => c.component === 'layerController');
  const spatialDef = layout.find(c => c.component === 'spatial');
  if (lcDef && spatialDef.coordinationScopes) {
    lcDef.coordinationScopes = spatialDef.coordinationScopes;
  }

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
  const newConfig = cloneDeep(config);
  const { coordinationSpace } = newConfig;

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

  const layout = newConfig.layout.map((component) => {
    const newComponent = { ...component };

    function replaceCoordinationScope(layerType) {
      const isRaster = layerType === 'raster';
      if (
        ['spatial', 'layerController'].includes(newComponent.component)
        || (newComponent.component === 'description' && isRaster)
      ) {
        newComponent.coordinationScopes[`spatial${capitalize(layerType)}Layer${isRaster ? 's' : ''}`] = newComponent
          .coordinationScopes.spatialLayers;
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
    ...newConfig,
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

// Added in version 1.0.7:
// - Support for aliasing the gene identifiers using a different var dataframe column
// via a new `geneAlias` option for the `anndata-expression-matrix.zarr` fileType.
export function upgradeFrom1_0_6(config) {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.7',
  };
}

// Added in version 1.0.8:
// - Support for multiple `dataset` coordination scopes and
// dataset-specific coordination scope mappings for all
// other coordination types.
export function upgradeFrom1_0_7(config) {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.8',
  };
}

// Added in version 1.0.9:
// - Support for plugin coordination types.
export function upgradeFrom1_0_8(config) {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.9',
  };
}

// Added in version 1.0.10:
// - Support for the optional 'uid' property for views.
export function upgradeFrom1_0_9(config) {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.10',
  };
}

// Added in version 1.0.11:
// - Changes to spatial layer coordination type names.
// - Cell -> Obs, Gene -> Feature in coordination type names.
export function upgradeFrom1_0_10(config) {
  const coordinationSpace = { ...config.coordinationSpace };

  const scopeAnalogies = {
    // Spatial layer types
    spatialRasterLayers: 'spatialImageLayer',
    spatialCellsLayer: 'spatialSegmentationLayer',
    spatialMoleculesLayer: 'spatialPointLayer',
    spatialNeighborhoodsLayer: 'spatialNeighborhoodLayer',
    // Other types
    cellFilter: 'obsFilter',
    cellHighlight: 'obsHighlight',
    cellSelection: 'obsSelection',
    cellSetSelection: 'obsSetSelection',
    cellSetHighlight: 'obsSetHighlight',
    cellSetColor: 'obsSetColor',
    geneFilter: 'featureFilter',
    geneHighlight: 'featureHighlight',
    geneSelection: 'featureSelection',
    geneExpressionColormap: 'featureValueColormap',
    geneExpressionColormapRange: 'featureValueColormapRange',
    cellColorEncoding: 'obsColorEncoding',
    additionalCellSets: 'additionalObsSets',
    embeddingCellSetPolygonsVisible: 'embeddingObsSetPolygonsVisible',
    embeddingCellSetLabelsVisible: 'embeddingObsSetLabelsVisible',
    embeddingCellSetLabelSize: 'embeddingObsSetLabelSize',
    embeddingCellRadius: 'embeddingObsRadius',
    embeddingCellRadiusMode: 'embeddingObsRadiusMode',
    embeddingCellOpacity: 'embeddingObsOpacity',
    embeddingCellOpacityMode: 'embeddingObsOpacityMode',
  };

  Object.entries(scopeAnalogies).forEach(([oldKey, newKey]) => {
    if (coordinationSpace[oldKey]) {
      coordinationSpace[newKey] = coordinationSpace[oldKey];
      delete coordinationSpace[oldKey];
    }
  });

  const layout = config.layout.map((component) => {
    const newComponent = { ...component };
    const { coordinationScopes = {} } = newComponent;

    Object.entries(scopeAnalogies).forEach(([oldKey, newKey]) => {
      if (coordinationScopes[oldKey]) {
        coordinationScopes[newKey] = coordinationScopes[oldKey];
        delete coordinationScopes[oldKey];
      }
    });

    return {
      ...newComponent,
      coordinationScopes,
    };
  });

  return {
    ...config,
    coordinationSpace,
    layout,
    version: '1.0.11',
  };
}

// Added in version 1.0.12:
// - Added a fileType-to-dataType mapping
// so that datasets[].files[].type is no longer required.
export function upgradeFrom1_0_11(config) {
  const newConfig = cloneDeep(config);

  const {
    datasets,
    coordinationSpace,
  } = newConfig;

  if (coordinationSpace.embeddingType) {
    // This array may contain more embedding types than
    // the cells.json file actually contains, but the tradeoff is that
    // we do not have to load the cells.json file to double check what
    // embedding types are actually present. CellsJsonAsObsEmbedding
    // will just load the embedding as null if it is not present.
    const embeddingTypes = Object.values(coordinationSpace.embeddingType);
    datasets.forEach((dataset, i) => {
      const { files } = dataset;
      files.forEach((fileDef, j) => {
        const { fileType } = fileDef;
        if (fileType === 'cells.json') {
          datasets[i].files[j].options = {
            embeddingTypes,
          };
        }
      });
    });
  }

  return {
    ...newConfig,
    datasets,
    version: '1.0.12',
  };
}

// Added in version 1.0.13:
// - Adds the property `coordinationValues` for
// view config file definitions but is not yet
// used to do file matching/lookups.
export function upgradeFrom1_0_12(config) {
  const newConfig = cloneDeep(config);

  // Set up coordination scopes for anndata-cells.zarr's options.factors
  // in the coordination space, and create a new coordinationScopes.obsLabelsType array
  // for each component in the layout.
  const { datasets, coordinationSpace, layout } = newConfig;
  const datasetUidToObsLabelsTypeScopes = {};
  datasets.forEach((dataset) => {
    const { files, uid } = dataset;
    files.forEach((fileDef) => {
      const { fileType, options = {} } = fileDef;
      if (fileType === 'anndata-cells.zarr') {
        const { factors } = options;
        if (factors) {
          const obsLabelsTypeScopes = [];
          factors.forEach((olt) => {
            const nextScope = getNextScope(Object.keys(coordinationSpace?.obsLabelsType || {}));
            coordinationSpace.obsLabelsType = {
              ...coordinationSpace.obsLabelsType,
              // Need to remove the obs/ prefix.
              [nextScope]: olt.split('/').at(-1),
            };
            obsLabelsTypeScopes.push(nextScope);
          });
          datasetUidToObsLabelsTypeScopes[uid] = obsLabelsTypeScopes;
        }
      }
    });
  });
  function getDatasetUidForView(viewDef) {
    if (viewDef.coordinationScopes?.dataset) {
      return coordinationSpace.dataset[viewDef.coordinationScopes.dataset];
    }
    if (datasets.length > 0) {
      return datasets[0].uid;
    }
    return null;
  }
  const newLayout = layout.map((viewDef) => {
    const viewDatasetUid = getDatasetUidForView(datasets, coordinationSpace, viewDef);
    const datasetObsLabelsTypeScopes = datasetUidToObsLabelsTypeScopes[viewDatasetUid];
    if (datasetObsLabelsTypeScopes) {
      return {
        ...viewDef,
        coordinationScopes: {
          ...viewDef.coordinationScopes,
          obsLabelsType: datasetObsLabelsTypeScopes,
        },
      };
    }
    return viewDef;
  });

  return {
    ...newConfig,
    coordinationSpace,
    layout: newLayout,
    version: '1.0.13',
  };
}

// Added in version 1.0.14:
// - Adds the coordination types
// gatingFeatureSelectionX,
// gatingFeatureSelectionY,
// featureValueTransformCoefficient.
export function upgradeFrom1_0_13(config) {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.14',
  };
}

// Added in version 1.0.15:
// - Changes the following view names:
//   - genes -> featureList
//   - cellSets -> obsSets
//   - cellSetSizes -> obsSetSizes
//   - cellSetExpression -> obsSetFeatureValueDistribution
//   - expressionHistogram -> featureValueHistogram
// - Deprecates the props:
//   - variablesLabelOverride
//   - observationsLabelOverride
export function upgradeFrom1_0_14(config) {
  const newConfig = cloneDeep(config);
  const { layout } = newConfig;

  const viewTypeAnalogies = {
    genes: 'featureList',
    cellSets: 'obsSets',
    cellSetSizes: 'obsSetSizes',
    cellSetExpression: 'obsSetFeatureValueDistribution',
    expressionHistogram: 'featureValueHistogram',
  };
  // Handle the view type renaming.
  const newLayout = layout.map((viewDef) => {
    // Replace the old component name with the new one.
    if (viewTypeAnalogies[viewDef.component]) {
      return {
        ...viewDef,
        component: viewTypeAnalogies[viewDef.component],
      };
    }
    return viewDef;
  });
  const propAnalogies = {
    variablesLabelOverride: 'featureType',
    observationsLabelOverride: 'obsType',
  };
  // Warn about the prop usage.
  newLayout.forEach((viewDef) => {
    // Iterate over each old prop key.
    Object.entries(propAnalogies).forEach(([oldProp, newType]) => {
      if (viewDef.props?.[oldProp]) {
        console.warn(`Warning: the '${oldProp}' prop on the ${viewDef.component} view is deprecated. Please use the '${newType}' coordination type instead.`);
      }
    });
  });
  return {
    ...newConfig,
    version: '1.0.15',
    layout: newLayout,
  };
}