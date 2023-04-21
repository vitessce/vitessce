/* eslint-disable camelcase */
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import cloneDeep from 'lodash/cloneDeep';
import { getNextScope, capitalize } from '@vitessce/utils';
import {
  configSchema0_1_0,
  configSchema1_0_0,
  configSchema1_0_1,
  configSchema1_0_2,
  configSchema1_0_3,
  configSchema1_0_4,
  configSchema1_0_5,
  configSchema1_0_6,
  configSchema1_0_7,
  configSchema1_0_8,
  configSchema1_0_9,
  configSchema1_0_10,
  configSchema1_0_11,
  configSchema1_0_12,
  configSchema1_0_13,
  configSchema1_0_14,
  configSchema1_0_15,
  configSchema1_0_16,
  configSchema1_0_17,
} from './previous-base-schemas';
import { componentCoordinationScopes, componentCoordinationScopesBy } from './shared';
import { fromEntries } from '@vitessce/utils';


interface ViewProps {
  target: [number, number];
  zoom: number;
}

const coordinationSpaceSchema1_0_0 = configSchema1_0_0
  .shape.coordinationSpace.unwrap();
const viewCoordinationScopes1_0_0 = configSchema1_0_0
  .shape.layout.element.shape.coordinationScopes.unwrap();

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
function upgradeReplaceViewProp(
  prefix: string,
  view: ViewProps,
  coordinationSpace: z.infer<typeof coordinationSpaceSchema1_0_0>,
) {
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
export function upgradeFrom0_1_0(
  config: z.infer<typeof configSchema0_1_0>,
  datasetUid: string | null = null,
): z.infer<typeof configSchema1_0_0> {
  const coordinationSpace: z.infer<typeof configSchema1_0_0.shape.coordinationSpace> = {
    embeddingType: {},
    embeddingZoom: {},
    embeddingTargetX: {},
    embeddingTargetY: {},
    spatialZoom: {},
    spatialTargetX: {},
    spatialTargetY: {},
  };

  const layout: z.infer<typeof configSchema1_0_0.shape.layout> = [];
  config.staticLayout.forEach((componentDef) => {
    let newComponentDef = {
      ...componentDef,
      coordinationScopes: {},
    };
    if (componentDef.component === 'scatterplot') {
      // Need to set up the coordinationSpace
      // with embeddingType to replace scatterplot
      // component prop "mapping".
      if (componentDef.props?.mapping && typeof componentDef.props.mapping === 'string') {
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
      if (componentDef.props?.view) {
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
  if (lcDef && spatialDef && 'coordinationScopes' in spatialDef) {
    lcDef.coordinationScopes = spatialDef.coordinationScopes;
  }

  // Use a random dataset ID when initializing automatically,
  // so that it changes with each new v0.1.0 view config.
  // However, check if the `datasetUid` parameter was passed,
  // which allows for unit testing.
  const newDatasetUid = datasetUid || uuidv4();

  return {
    version: '1.0.0',
    name: config.name,
    description: config.description,
    public: config.public,
    datasets: [
      {
        uid: newDatasetUid,
        name: newDatasetUid,
        files: config.layers.map(layer => ({
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

export function upgradeFrom1_0_0(
  config: z.infer<typeof configSchema1_0_0>,
): z.infer<typeof configSchema1_0_1> {
  const newConfig = cloneDeep(config);
  const { coordinationSpace } = newConfig;

  function replaceLayerType(
    layerType: string,
    cSpace: z.infer<typeof coordinationSpaceSchema1_0_0>,
  ) {
    // Layer type could be one of a few things, bitmask or raster at the moment.
    const isRaster = layerType === 'raster';
    // eslint-disable-next-line no-param-reassign
    cSpace[`spatial${capitalize(layerType)}Layer${isRaster ? 's' : ''}`] = {};
    Object.entries(cSpace.spatialLayers).forEach(([scope, layers]) => {
      if (Array.isArray(layers) && layers.find(layer => layer.type === layerType)) {
        const typedLayers = layers
          .filter(layer => layer.type === layerType)
          .map((layer) => {
            const newLayer = { ...layer };
            delete newLayer.type;
            return newLayer;
          });
        // eslint-disable-next-line no-param-reassign
        cSpace[`spatial${capitalize(layerType)}Layer${isRaster ? 's' : ''}`][scope] = isRaster
          ? typedLayers
          : typedLayers[0];
      } else {
        // eslint-disable-next-line no-param-reassign
        cSpace[`spatial${capitalize(layerType)}Layer${isRaster ? 's' : ''}`][scope] = null;
      }
    });
  }

  if (coordinationSpace && 'spatialLayers' in coordinationSpace) {
    replaceLayerType('raster', coordinationSpace);
    replaceLayerType('cells', coordinationSpace);
    replaceLayerType('molecules', coordinationSpace);
    replaceLayerType('neighborhoods', coordinationSpace);
    delete coordinationSpace.spatialLayers;
  }

  const layout = newConfig.layout.map((component) => {
    const newComponent = { ...component };

    function replaceCoordinationScope(
      layerType: string,
      cScopes: z.infer<typeof viewCoordinationScopes1_0_0>,
    ) {
      const isRaster = layerType === 'raster';
      if (
        ['spatial', 'layerController'].includes(newComponent.component)
        || (newComponent.component === 'description' && isRaster)
      ) {
        // eslint-disable-next-line no-param-reassign
        cScopes[`spatial${capitalize(layerType)}Layer${isRaster ? 's' : ''}`] = cScopes.spatialLayers;
      }
    }

    if (newComponent.coordinationScopes && newComponent.coordinationScopes.spatialLayers) {
      replaceCoordinationScope('raster', newComponent.coordinationScopes);
      replaceCoordinationScope('cells', newComponent.coordinationScopes);
      replaceCoordinationScope('molecules', newComponent.coordinationScopes);
      replaceCoordinationScope('neighborhoods', newComponent.coordinationScopes);
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

interface SpatialRasterLayer1_0_0 {
  type: 'bitmask' | 'raster';
}

export function upgradeFrom1_0_1(
  config: z.infer<typeof configSchema1_0_1>,
): z.infer<typeof configSchema1_0_2> {
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
    if (newConfig.coordinationSpace?.spatialRasterLayers?.[key]) {
      newConfig.coordinationSpace.spatialRasterLayers[key]
        .forEach((layer: SpatialRasterLayer1_0_0, index: number) => {
          if (newConfig.coordinationSpace) {
            newConfig.coordinationSpace.spatialRasterLayers[key][index].type = ['bitmask', 'raster'].includes(layer.type) ? layer.type : 'raster';
          }
        });
    }
  });

  return {
    ...newConfig,
    layout,
    version: '1.0.2',
  };
}

export function upgradeFrom1_0_2(
  config: z.infer<typeof configSchema1_0_2>,
): z.infer<typeof configSchema1_0_3> {
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

export function upgradeFrom1_0_3(
  config: z.infer<typeof configSchema1_0_3>,
): z.infer<typeof configSchema1_0_4> {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.4',
  };
}

// Added in version 1.0.5:
// - Support for an array of strings in the setName property within options array items
//   for the anndata-cell-sets.zarr file type.
export function upgradeFrom1_0_4(
  config: z.infer<typeof configSchema1_0_4>,
): z.infer<typeof configSchema1_0_5> {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.5',
  };
}


// Added in version 1.0.6:
// - Support for the scoreName property within options array items
//   for the anndata-cell-sets.zarr file type.
export function upgradeFrom1_0_5(
  config: z.infer<typeof configSchema1_0_5>,
): z.infer<typeof configSchema1_0_6> {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.6',
  };
}

// Added in version 1.0.7:
// - Support for aliasing the gene identifiers using a different var dataframe column
// via a new `geneAlias` option for the `anndata-expression-matrix.zarr` fileType.
export function upgradeFrom1_0_6(
  config: z.infer<typeof configSchema1_0_6>,
): z.infer<typeof configSchema1_0_7> {
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
export function upgradeFrom1_0_7(
  config: z.infer<typeof configSchema1_0_7>,
): z.infer<typeof configSchema1_0_8> {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.8',
  };
}

// Added in version 1.0.9:
// - Support for plugin coordination types.
export function upgradeFrom1_0_8(
  config: z.infer<typeof configSchema1_0_8>,
): z.infer<typeof configSchema1_0_9> {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.9',
  };
}

// Added in version 1.0.10:
// - Support for the optional 'uid' property for views.
export function upgradeFrom1_0_9(
  config: z.infer<typeof configSchema1_0_9>,
): z.infer<typeof configSchema1_0_10> {
  const newConfig = cloneDeep(config);

  return {
    ...newConfig,
    version: '1.0.10',
  };
}

// Added in version 1.0.11:
// - Changes to spatial layer coordination type names.
// - Cell -> Obs, Gene -> Feature in coordination type names.
export function upgradeFrom1_0_10(
  config: z.infer<typeof configSchema1_0_10>,
): z.infer<typeof configSchema1_0_11> {
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
export function upgradeFrom1_0_11(
  config: z.infer<typeof configSchema1_0_11>,
): z.infer<typeof configSchema1_0_12> {
  const newConfig = cloneDeep(config);

  const {
    datasets,
    coordinationSpace,
  } = newConfig;

  if (coordinationSpace?.embeddingType) {
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
export function upgradeFrom1_0_12(
  config: z.infer<typeof configSchema1_0_12>,
): z.infer<typeof configSchema1_0_13> {
  const newConfig = cloneDeep(config);

  // Set up coordination scopes for anndata-cells.zarr's options.factors
  // in the coordination space, and create a new coordinationScopes.obsLabelsType array
  // for each component in the layout.
  const { datasets, coordinationSpace, layout } = newConfig;
  const newCoordinationSpace: z.infer<typeof coordinationSpaceSchema1_0_0> = (
    coordinationSpace || {}
  );
  const datasetUidToObsLabelsTypeScopes: Record<string, string[]> = {};
  datasets.forEach((dataset) => {
    const { files, uid } = dataset;
    files.forEach((fileDef) => {
      const { fileType, options } = fileDef;
      if (fileType === 'anndata-cells.zarr') {
        if (options && 'factors' in options && Array.isArray(options.factors)) {
          const obsLabelsTypeScopes: string[] = [];
          options.factors.forEach((olt: string) => {
            const nextScope = getNextScope(Object.keys(coordinationSpace?.obsLabelsType || {}));
            newCoordinationSpace.obsLabelsType = {
              ...newCoordinationSpace.obsLabelsType,
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
  function getDatasetUidForView(
    viewDef: z.infer<typeof configSchema1_0_12.shape.layout.element>,
  ): string|null {
    if (viewDef.coordinationScopes?.dataset && typeof viewDef.coordinationScopes?.dataset === 'string') {
      return newCoordinationSpace.dataset[viewDef.coordinationScopes.dataset];
    }
    if (datasets.length > 0) {
      return datasets[0].uid;
    }
    return null;
  }
  const newLayout = layout.map((viewDef) => {
    const viewDatasetUid = getDatasetUidForView(viewDef);
    if (typeof viewDatasetUid === 'string') {
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
    }
    return viewDef;
  });

  return {
    ...newConfig,
    coordinationSpace: newCoordinationSpace,
    layout: newLayout,
    version: '1.0.13',
  };
}

// Added in version 1.0.14:
// - Adds the coordination types
// gatingFeatureSelectionX,
// gatingFeatureSelectionY,
// featureValueTransformCoefficient.
export function upgradeFrom1_0_13(
  config: z.infer<typeof configSchema1_0_13>,
): z.infer<typeof configSchema1_0_14> {
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
export function upgradeFrom1_0_14(
  config: z.infer<typeof configSchema1_0_14>,
): z.infer<typeof configSchema1_0_15> {
  const newConfig = cloneDeep(config);
  const { layout } = newConfig;

  const viewTypeAnalogies: Record<string, string> = {
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

// Added in version 1.0.16:
// - Explict coordinationScopesBy property for view definitions,
// to replace the previous implicit mapping of per-dataset coordination
// scopes.
export function upgradeFrom1_0_15(
  config: z.infer<typeof configSchema1_0_15>,
): z.infer<typeof configSchema1_0_16> {
  const newConfig = cloneDeep(config);

  const { layout } = newConfig;
  const newLayout = layout.map((view): z.infer<typeof configSchema1_0_16.shape.layout.element> => {
    const { coordinationScopes } = view;
    // Create a new coordinationScopes property that conforms to v1.0.16.
    const newCoordinationScopes: z.infer<typeof componentCoordinationScopes> = {};
    // Update coordinationScopes and coordinationScopesBy when required.
    if (coordinationScopes?.dataset && Array.isArray(coordinationScopes.dataset)) {
      const coordinationScopesBy: z.infer<typeof componentCoordinationScopesBy> = {
        dataset: {},
      };
      Object.entries(coordinationScopes).forEach(([coordinationType, coordinationScope]) => {
        if (!Array.isArray(coordinationScope) && typeof coordinationScope === 'object') {
          if (coordinationType === 'dataset') {
            console.error('Expected coordinationScopes.dataset value to be either string or string[], but got object.');
          }
          coordinationScopesBy.dataset[coordinationType] = coordinationScope;
        } else if (Array.isArray(coordinationScope) || typeof coordinationScope === 'string') {
          newCoordinationScopes[coordinationType] = coordinationScope;
        }
      });
      return {
        ...view,
        coordinationScopes: newCoordinationScopes,
        coordinationScopesBy,
      };
    }
    if (coordinationScopes) {
      Object.entries(coordinationScopes).forEach(([coordinationType, coordinationScope]) => {
        if (Array.isArray(coordinationScope) || typeof coordinationScope === 'string') {
          newCoordinationScopes[coordinationType] = coordinationScope;
        }
      });
    }
    return {
      ...view,
      coordinationScopes: newCoordinationScopes,
    };
  });

  return {
    ...newConfig,
    layout: newLayout,
    version: '1.0.16',
  };
}

// Added in version 1.0.17:
// - Use multi-level coordination to
// break up spatial layer coordination values
// (from arrays and nested objects to primitives).

// TODO: support async upgrade functions.
export async function upgradeFrom1_0_16(
  config: z.infer<typeof configSchema1_0_16>,
): z.infer<typeof configSchema1_0_17> {
  const newConfig = cloneDeep(config);

  const { datasets, layout, coordinationSpace = {} } = newConfig;

  const imageScopes: string[] = [];

  // First, update all image or obsSegmentations file definitions
  // within .datasets[].files[],
  // to ensure each file definition only maps to ONE image or segmentation file.
  // Multi-image or multi-segmentation files will use the new "image"
  // coordination type to specify which image or segmentation to use.
  const newDatasets = await Promise.all(datasets.map(async (dataset) => {
    const { files } = dataset;
    const newFiles = await Promise.all(files.map(async (fileDef) => {
      const {
        url, requestInit, fileType,
        options,
        coordinationValues,
      } = fileDef;

      if (fileType === 'image.raster.json' || fileType === 'raster.json') {
        let loadedOptions;
        if (!options && url) {
          loadedOptions = await fetch(url, (requestInit || {}) as any).then(r => r.json());
        } else if (options) {
          loadedOptions = options;
        } else {
          throw new Error('Expected either options or url for file definition, but found neither.');
        }

        // TODO: use renderLayers to determine which layers are visible/included, but only
        // if a corresponding spatialImageLayer coordination value did not exist in the config.
        const { images, renderLayers } = loadedOptions;

        // Iterate over each image definition
        // within the raster.json options object,
        // and create new file definitions.
        return images.filter(imageDef => (
          imageDef.type === 'ome-tiff' && !imageDef.metadata?.isBitmask
        )).map((imageDef) => {
          const {
            name, url: imageUrl, metadata,
          } = imageDef;
          const newFileDef = {
            fileType: 'image.ome-tiff',
            url: imageUrl,
            coordinationValues: {
              image: name,
            },
            ...(metadata?.omeTiffOffsetsUrl ? ({
              options: {
                offsetsUrl: metadata?.omeTiffOffsetsUrl,
              },
            }) : {}),
          };
          return newFileDef;
        });
      // TODO: add an image.deprecated-ome-zarr file type for bioformats-zarr precursor to OME-Zarr?
      // or just do not support altogether.
      }
      if (
        (fileType === 'image.ome-zarr' || fileType === 'image.ome-tiff')
        && !coordinationValues?.image
      ) {
        // The file is a single-image fileType but lacks an image coordination value.
        const nextImageScope = getNextScope(imageScopes);
        imageScopes.push(nextImageScope);
        return {
          ...fileDef,
          coordinationValues: {
            ...(coordinationValues || {}),
            image: nextImageScope,
          },
        };
      }

      // Keep the file definition as-is.
      return fileDef;
    }));

    const flatNewFiles = newFiles.flat();

    return {
      ...dataset,
      files: flatNewFiles,
    };
  }));

  // Update layout.

  // Map previous scope names to new meta-scope names.
  const prevImageLayerScopes: Record<string, string> = {};
  const prevSegmentationLayerScopes: Record<string, string> = {};
  const prevPointLayerScopes: Record<string, string> = {};

  const newLayout = layout.map((view) => {
    const { coordinationScopes = {}, component } = view;
    if (component === 'spatial' || component === 'layerController') {
      if (coordinationScopes.spatialImageLayer) {
        prevImageLayerScopes[coordinationScopes.spatialImageLayer as string] = getNextScope([
          ...Object.keys(coordinationSpace.metaCoordinationScopes || {}),
          ...Object.keys(coordinationSpace.metaCoordinationScopesBy || {}),
          ...Object.values(prevImageLayerScopes),
          ...Object.values(prevSegmentationLayerScopes),
          ...Object.values(prevPointLayerScopes),
        ]);
        coordinationScopes.metaCoordinationScopes = [
          ...(coordinationScopes.metaCoordinationScopes || []),
          prevImageLayerScopes[coordinationScopes.spatialImageLayer as string],
        ];
        coordinationScopes.metaCoordinationScopesBy = [
          ...(coordinationScopes.metaCoordinationScopesBy || []),
          prevImageLayerScopes[coordinationScopes.spatialImageLayer as string],
        ];
        delete coordinationScopes.spatialImageLayer;
      }
      if (coordinationScopes.spatialSegmentationLayer) {
        prevSegmentationLayerScopes[coordinationScopes.spatialSegmentationLayer as string] = getNextScope([
          ...Object.keys(coordinationSpace.metaCoordinationScopes || {}),
          ...Object.keys(coordinationSpace.metaCoordinationScopesBy || {}),
          ...Object.values(prevImageLayerScopes),
          ...Object.values(prevSegmentationLayerScopes),
          ...Object.values(prevPointLayerScopes),
        ]);
        coordinationScopes.metaCoordinationScopes = [
          ...(coordinationScopes.metaCoordinationScopes || []),
          prevSegmentationLayerScopes[coordinationScopes.spatialSegmentationLayer as string],
        ];
        coordinationScopes.metaCoordinationScopesBy = [
          ...(coordinationScopes.metaCoordinationScopesBy || []),
          prevSegmentationLayerScopes[coordinationScopes.spatialSegmentationLayer as string],
        ];
        delete coordinationScopes.spatialSegmentationLayer;
      }
      if (coordinationScopes.spatialPointLayer) {
        prevPointLayerScopes[coordinationScopes.spatialPointLayer as string] = getNextScope([
          ...Object.keys(coordinationSpace.metaCoordinationScopes || {}),
          ...Object.keys(coordinationSpace.metaCoordinationScopesBy || {}),
          ...Object.values(prevImageLayerScopes),
          ...Object.values(prevSegmentationLayerScopes),
          ...Object.values(prevPointLayerScopes),
        ]);
        coordinationScopes.metaCoordinationScopes = [
          ...(coordinationScopes.metaCoordinationScopes || []),
          prevPointLayerScopes[coordinationScopes.spatialPointLayer as string],
        ];
        coordinationScopes.metaCoordinationScopesBy = [
          ...(coordinationScopes.metaCoordinationScopesBy || []),
          prevPointLayerScopes[coordinationScopes.spatialPointLayer as string],
        ];
        delete coordinationScopes.spatialPointLayer;
      }
    }
    return view;
  });

  // Update coordinationSpace, using the above meta-coordination scope mapping.
  const newCoordinationSpace: Record<string, Record<string, object>> = {
    // Create empty metaCoordinationScopes
    metaCoordinationScopes: {
      ...coordinationSpace.metaCoordinationScopes,
      ...fromEntries(
        [
          ...Object.values(prevImageLayerScopes),
          ...Object.values(prevSegmentationLayerScopes),
          ...Object.values(prevPointLayerScopes),
        ].map(scope => ([scope, {}])),
      ),
    },
    metaCoordinationScopesBy: {
      ...coordinationSpace.metaCoordinationScopesBy,
      ...fromEntries(
        [
          ...Object.values(prevImageLayerScopes),
          ...Object.values(prevSegmentationLayerScopes),
          ...Object.values(prevPointLayerScopes),
        ].map(scope => ([scope, {}])),
      ),
    },
  };
  Object.entries(coordinationSpace).forEach(([coordinationType, coordinationSpaceDef]) => {
    if (coordinationType === 'metaCoordinationScopes' || coordinationType === 'metaCoordinationScopesBy') {
      // Do nothing.
      // Already handled above the forEach.
    } else if (coordinationType === 'spatialImageLayer') {
      // Create empty spatialImageLayer coordination object.
      newCoordinationSpace.spatialImageLayer = {};
      newCoordinationSpace.image = {};
      newCoordinationSpace.spatialLayerVisible = {};
      newCoordinationSpace.spatialLayerOpacity = {};
      newCoordinationSpace.spatialImageChannel = {};
      newCoordinationSpace.spatialTargetC = {};
      newCoordinationSpace.spatialTargetZ = {};
      newCoordinationSpace.spatialTargetT = {};
      newCoordinationSpace.spatialChannelVisible = {};
      newCoordinationSpace.spatialChannelColor = {};
      newCoordinationSpace.spatialChannelColormap = {};
      newCoordinationSpace.spatialWindowSliderMode = {};
      newCoordinationSpace.spatialTransparentColor = {};
      newCoordinationSpace.spatialRenderingMode = {};
      newCoordinationSpace.spatialImageVolumeRenderingMethod = {};
      newCoordinationSpace.spatialChannelWindowRange = {};
      newCoordinationSpace.spatialModelMatrix = {};
      // Iterate over each previous spatialImageLayer.
      Object.entries(coordinationSpaceDef).forEach(([scope, value]) => {
        // Create a new dummy spatialImageLayer coordination scope
        // for each element of the _old_ spatialImageLayer array of layer objects.
        const spatialImageLayerDummyScopes: string[] = [];
        if (Array.isArray(value)) {
          value.forEach(() => {
            const imageLayerDummyScope = getNextScope([
              // Also need to consider any spatialImageLayer scope names
              // that were added in a previous iteration.
              ...Object.keys(newCoordinationSpace.spatialImageLayer || {}),
              ...spatialImageLayerDummyScopes,
            ]);
            spatialImageLayerDummyScopes.push(imageLayerDummyScope);

            // Set values in the coordination space for this image layer definition.
            newCoordinationSpace.spatialImageLayer[imageLayerDummyScope] = '__dummy__';


          });
        }



        
        newCoordinationSpace.metaCoordinationScopes[prevImageLayerScopes[scope]] = {
          spatialImageLayer: spatialImageLayerDummyScopes,
        };
      });
    } else {
      // Keep the coordination space definition as-is.
      newCoordinationSpace[coordinationType] = coordinationSpaceDef;
    }
  });


  return {
    ...newConfig,
    datasets: newDatasets,
    layout: newLayout,
    coordinationSpace: newCoordinationSpace,
    version: '1.0.17',
  }
}
