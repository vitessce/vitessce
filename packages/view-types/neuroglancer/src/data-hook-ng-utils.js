import { DataType } from '@vitessce/constants-internal';
import { cloneDeep, isEqual } from 'lodash-es';
import { useMemoCustomComparison } from '@vitessce/vit-s';
import { mergeObsSets, treeFindNodeByNamePath, treeToLeafSets } from '@vitessce/sets-utils';
import { getDefaultColor } from '@vitessce/utils';
import { customIsEqualForInitialViewerState } from './use-memo-custom-equals.js';
import { NG_CAMERA_VALIDATORS } from './utils.js';
import { getPointsShader, DEFAULT_POINT_MARKER_SIZE } from './shader-utils.js';

export const DEFAULT_NG_DIMENSIONS = {
  x: [1, 'nm'],
  y: [1, 'nm'],
  z: [1, 'nm'],
};

export const UNIT_TO_NM = {
  nm: 1,
  um: 1e3,
  µm: 1e3,
  mm: 1e6,
  cm: 1e7,
  m: 1e9,
};

export const DEFAULT_NG_PROPS = {
  layout: '3d',
  position: [0, 0, 0],
  projectionOrientation: [0, 0, 0, 1],
  projectionScale: 1024,
  crossSectionScale: 1,
  dimensions: DEFAULT_NG_DIMENSIONS,
  layers: [],
};

// NG annotation render-scale target range (render_scale_statistics.ts): [2^-4, 2^16].
const MIN_ANNOTATION_SPACING = 0.0625;
const MAX_ANNOTATION_SPACING = 65536;
const INTEGER_ANNOTATION_TYPES = ['uint8', 'int8', 'uint16', 'int16', 'uint32', 'int32'];

/**
 * Get the obsSet group name -> column name mapping from the options
 * of the obsSets files (CSV: `column`, AnnData/SpatialData: `path`).
 * For a hierarchy of columns, the finest level holds the leaf sets.
 * @param {object[]} obsSetsLoaders Loaders of the obsSets data type.
 * @returns {Record<string, string>}
 */
export function getObsSetColumnsByName(obsSetsLoaders) {
  const result = {};
  (obsSetsLoaders ?? []).forEach((loader) => {
    loader?.options?.obsSets?.forEach(({ name, column, path }) => {
      const columns = [].concat(column ?? path ?? []);
      const finest = columns[columns.length - 1];
      if (name && finest) {
        // e.g. 'obs/phenotype_fine' -> 'phenotype_fine'
        result[name] = String(finest).split('/').pop();
      }
    });
  });
  return result;
}

/**
 * Get one "column" per obsSet group: the enum annotation property
 * holding the group's categories. This is the analog of the raw
 * categorical codes columns used by colorIndicesFromCodes
 * (`{ path, categories }`), with the codes living in the annotation chunks.
 * A group is matched to a property by the column name in the obsSets
 * file options, then by the group name, and otherwise by the enum_labels
 * containing the most of the group's set names. An integer property
 * without enum_labels, matched by name, is assumed to hold the indices
 * of the alphabetically sorted category names.
 * @param {object} obsSets The (merged) obsSets tree object.
 * @param {object|null} neuroglancerInfo The annotation info JSON.
 * @param {Record<string, string>} obsSetColumnsByName See getObsSetColumnsByName.
 * @param {string[][]} selectedNamePaths Only the groups of these paths get a column.
 * @returns {{ path: string[], prop: string, categories: string[],
 *   values: number[] }[]}
 */
export function getObsSetAnnotationColumns(
  obsSets, neuroglancerInfo, obsSetColumnsByName, selectedNamePaths,
) {
  const selectedGroupNames = new Set((selectedNamePaths || []).map(path => path[0]));
  const enumProps = (neuroglancerInfo?.properties ?? []).filter(p => (
    Array.isArray(p.enum_labels) && Array.isArray(p.enum_values)
  ));
  return (obsSets?.tree ?? []).filter(({ name }) => selectedGroupNames.has(name)).map((groupNode) => {
    const groupName = groupNode.name;
    const byName = id => enumProps.find(p => p.id === id);
    let prop = byName(obsSetColumnsByName?.[groupName]) ?? byName(groupName);
    if (!prop) {
      const leafNames = treeToLeafSets({ tree: [groupNode] })
        .map(({ path }) => String(path[path.length - 1]));
      const scores = enumProps.map(p => (
        leafNames.filter(name => p.enum_labels.map(String).includes(name)).length
      ));
      const bestScore = Math.max(0, ...scores);
      const best = enumProps.filter((p, i) => bestScore > 0 && scores[i] === bestScore);
      if (best.length > 1) {
        console.warn(`obsSet group "${groupName}" matches several annotation properties (${best.map(p => p.id).join(', ')}); using "${best[0].id}". Name the obsSets column after the annotation property to disambiguate.`);
      }
      [prop] = best;
    }
    if (!prop) {
        // A property without enum_labels, matched by name (e.g., `phenotype`
        // in data written before enum labels were added): assume the codes are
        // the indices of the alphabetically sorted category names.
        const intProp = (neuroglancerInfo?.properties ?? []).find(p => (
          INTEGER_ANNOTATION_TYPES.includes(p.type)
          && (p.id === obsSetColumnsByName?.[groupName] || p.id === groupName)
        ));
        if (!intProp) return null;
        const categories = treeToLeafSets({ tree: [groupNode] })
          .map(({ path }) => String(path[path.length - 1]))
          .sort();
        return {
          path: [groupName],
          prop: intProp.id,
          categories,
          values: categories.map((_, i) => i),
        };
      }
    return {
      path: [groupName],
      prop: prop.id,
      categories: prop.enum_labels.map(String),
      values: prop.enum_values,
    };
  }).filter(Boolean);
}

/**
 * The centroid-shader analog of colorIndicesFromCodes: map the selected
 * set paths onto (annotation property, enum values) rules, so that the
 * shader can color points from their categorical codes.
 * Later paths take precedence, matching treeToCellColorsBySetNames.
 * Unlike colorIndicesFromCodes, a selected non-leaf node resolves to the
 * codes of all its leaf sets. Paths which do not resolve (e.g.,
 * user-defined selections from additionalObsSets) are skipped,
 * since there is no tree-based fallback for annotation points.
 * @param {object} params
 * @param {object[]} params.columns See getObsSetAnnotationColumns.
 * @param {object} params.obsSets The (merged) obsSets tree object.
 * @param {string[][]} params.selectedNamePaths
 * @param {object[]} params.cellSetColor
 * @param {string} params.theme
 * @returns {{ prop: string, codes: number[], color: number[] }[]}
 */
export function obsSetRulesFromCodes({
  columns, obsSets, selectedNamePaths, cellSetColor, theme,
}) {
  const unresolved = [];
  const rules = (selectedNamePaths || []).map((setNamePath) => {
    const column = columns.find(({ path }) => (
      path.length <= setNamePath.length
      && path.every((part, k) => part === setNamePath[k])
    ));
    const node = obsSets ? treeFindNodeByNamePath(obsSets, setNamePath) : null;
    const leafNames = node
      ? treeToLeafSets({ tree: [node] }).map(({ path }) => String(path[path.length - 1]))
      : [String(setNamePath[setNamePath.length - 1])];
    const codes = column
      ? leafNames
        .map(name => column.categories.indexOf(name))
        .filter(i => i >= 0)
        .map(i => column.values[i])
      : [];
    if (codes.length === 0) {
      unresolved.push(setNamePath.join(' / '));
      return null;
    }
    const color = cellSetColor?.find(d => isEqual(d.path, setNamePath))?.color
      || getDefaultColor(theme);
    return { prop: column.prop, codes, color };
  }).filter(Boolean);
  if (unresolved.length > 0) {
    console.warn(`Segmentation centroids cannot be colored for the sets [${unresolved.join(', ')}]: no enum annotation property contains these categories.`);
  }
  return rules;
}


/**
 * Validate initialNgCameraState field by field. Invalid values fall back to a
 * default where one is meaningful; `position` is left out instead, so the
 * subscriber can derive it from the data bounds.
 * @param {object} cameraState
 * @param {object} [fallbacks] Defaults for invalid fields.
 */
export function sanitizeNgCameraState(cameraState, fallbacks = {}) {
  const defaults = {
    projectionOrientation: [0, 0, 0, 1],
    projectionScale: DEFAULT_NG_PROPS.projectionScale,
    crossSectionScale: DEFAULT_NG_PROPS.crossSectionScale,
    ...fallbacks,
  };
  const result = {};
  Object.entries(cameraState ?? {}).forEach(([key, value]) => {
    const validate = NG_CAMERA_VALIDATORS[key];
    if (!validate) {
      if (value !== undefined) result[key] = value;
      return;
    }
    if (validate(value)) {
      result[key] = value;
    } else if (key in defaults) {
      console.warn(`Invalid initialNgCameraState.${key}:`, value, '— using default', defaults[key]);
      result[key] = defaults[key];
    } else {
      console.warn(`Invalid initialNgCameraState.${key}:`, value, '— ignored');
    }
  });
  return result;
}

/**
 * Validate an NG coordinate-space dimensions object:
 * { x: [scale, unit], y: [scale, unit], z: [scale, unit] }.
 */
export function isValidNgDimensions(dims) {
  return !!dims && typeof dims === 'object'
    && ['x', 'y', 'z'].every(axis => Array.isArray(dims[axis])
      && dims[axis].length === 2
      && Number.isFinite(dims[axis][0]) && dims[axis][0] > 0
      && typeof dims[axis][1] === 'string');
}

/**
 * Resolve the viewer's global `dimensions` once, independent of layer order.
 * A point layer's `transform.outputDimensions` describes that layer's own
 * output space; NG maps it into the global space per layer, so it must not
 * overwrite the viewer dimensions.
 * Precedence:
 *   1. explicit `viewerDimensions` (Neuroglancer view prop),
 *   2. the first point layer (in scope order) that declares outputDimensions,
 *   3. DEFAULT_NG_DIMENSIONS.
 * @param {Array<{ name: string, neuroglancerOptions: object }>} annotationSources
 * Point layers and segmentation centroid layers.
 * @param {object|null} viewerDimensionsOverride
 */
export function resolveViewerDimensions(
  annotationSources, viewerDimensionsOverride = null,
) {
  if (viewerDimensionsOverride != null) {
    if (isValidNgDimensions(viewerDimensionsOverride)) return viewerDimensionsOverride;
    console.warn('Ignoring invalid viewerDimensions prop; expected { x: [scale, unit], y: [scale, unit], z: [scale, unit] }.');
  }
  const declared = (annotationSources ?? [])
    .map(({ name: scope, neuroglancerOptions }) => ({
      scope,
      dims: neuroglancerOptions?.transform?.outputDimensions,
    }))
    .filter(({ dims }) => dims);
  if (!declared.length) return DEFAULT_NG_DIMENSIONS;
  const [{ dims: viewerDims }] = declared;
  const mismatched = declared.filter(({ dims }) => !isEqual(dims, viewerDims));
  if (mismatched.length) {
    console.warn(
      `Point layers declare different outputDimensions; using those of "${declared[0].scope}" `
      + `for the viewer. Layers ${mismatched.map(({ scope }) => `"${scope}"`).join(', ')} `
      + 'keep their own outputDimensions in their source transform.',
    );
  }
  return viewerDims;
}

function toPrecomputedSource(url) {
  if (!url) {
    throw new Error('toPrecomputedSource: URL is required');
  }
  return `precomputed://${url}`;
}

function isInNanometerRange(value, unit, minNm = 1, maxNm = 100) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return false;

  const factor = unit && UNIT_TO_NM[unit];
  if (!factor) return false;

  const nm = n * factor;
  return nm >= minNm && nm <= maxNm;
}

/**
   * Normalize dimensionX/Y/Z to nanometers.
   * @param {object} opts
   * @returns {{ x:[number,'nm'], y:[number,'nm'], z:[number,'nm'] }}
   */
export function normalizeDimensionsToNanometers(opts) {
  const {
    dimensionUnit,
    dimensionX,
    dimensionY,
    dimensionZ,
    ...otherOptions
  } = opts;

  if (!dimensionUnit || !dimensionX || !dimensionY || !dimensionZ) {
    console.warn('Missing dimension info');
  }
  const xNm = isInNanometerRange(dimensionX, dimensionUnit);
  const yNm = isInNanometerRange(dimensionY, dimensionUnit);
  const zNm = isInNanometerRange(dimensionZ, dimensionUnit);
  if (!xNm || !yNm || !zNm) {
    console.warn('Dimension was converted to nm units');
  }
  return {
    // The dimension-related fields are formatted differently in the fileDef.options
    // vs. what the viewerState expects.
    dimensions: {
      x: xNm ? [dimensionX, dimensionUnit] : [1, 'nm'],
      y: yNm ? [dimensionY, dimensionUnit] : [1, 'nm'],
      z: zNm ? [dimensionZ, dimensionUnit] : [1, 'nm'],
    },
    // The non-dimension-related options can be passed through without modification.
    ...otherOptions,
  };
}

export function toNgLayerName(dataType, layerScope, channelScope = null) {
  if (dataType === DataType.OBS_SEGMENTATIONS) {
    return `obsSegmentations-${layerScope}-${channelScope}`;
  }
  if (dataType === DataType.OBS_POINTS) {
    return `obsPoints-${layerScope}`;
  }
  if (dataType === DataType.OBS_LOCATIONS) {
    // Centroids of a segmentation layer/channel.
    return `obsLocations-${layerScope}-${channelScope}`;
  }
  throw new Error(`Unsupported data type: ${dataType}`);
}

/**
 * Get the centroid annotation sources of the segmentation layers/channels.
 * A segmentation channel has centroids when an `obsLocations.ng-annotations`
 * file is defined for its obsType. The centroids are rendered implicitly,
 * using the visual properties of the segmentation layer/channel.
 * @param {object} params
 * @param {string[]} params.segmentationLayerScopes
 * @param {object} params.segmentationChannelScopesByLayer
 * @param {object} params.obsSegmentationsLocationsData Nested by layer and channel scope.
 * @returns {Array<{
 *   layerScope: string,
 *   channelScope: string,
 *   name: string,
 *   url: string,
 *   neuroglancerOptions: object,
 *   neuroglancerInfo: object|null,
 * }>}
 */
export function getSegmentationCentroidSources({
  segmentationLayerScopes,
  segmentationChannelScopesByLayer,
  obsSegmentationsLocationsData,
}) {
  return (segmentationLayerScopes ?? []).flatMap(layerScope => (
    (segmentationChannelScopesByLayer?.[layerScope] ?? [])
      .map((channelScope) => {
        const locationsData = obsSegmentationsLocationsData?.[layerScope]?.[channelScope];
        // Other obsLocations file types (e.g., non-Neuroglancer) are not centroid sources.
        if (locationsData?.obsLocationsTilingType !== 'neuroglancer'
          || !locationsData.neuroglancerUrl) {
          return null;
        }
        return {
          layerScope,
          channelScope,
          name: toNgLayerName(DataType.OBS_LOCATIONS, layerScope, channelScope),
          url: locationsData.neuroglancerUrl,
          neuroglancerOptions: locationsData.neuroglancerOptions ?? {},
          neuroglancerInfo: locationsData.neuroglancerInfo ?? null,
        };
      })
      .filter(Boolean)
  ));
}

// Border width of the centroid point markers.
const CENTROID_POINT_STROKE_WIDTH = 0.2;

/**
 * Map segmentation layer/channel coordination values onto the parameters
 * of getPointsShader, so that centroids share the visual properties
 * of their segmentation channel.
 * @param {object} layerCoordination Segmentation layer coordination values.
 * @param {object} channelCoordination Segmentation channel coordination values.
 * @returns {object} Parameters for getPointsShader
 * (excluding theme and the annotation property options).
 */
export function getCentroidShaderParams(layerCoordination, channelCoordination) {
  const {
    spatialLayerOpacity,
  } = layerCoordination || {};
  const {
    spatialChannelOpacity,
    spatialChannelColor,
    obsColorEncoding,
    featureValueColormap,
    featureValueColormapRange,
    obsSetColor,
    obsSetSelection,
    additionalObsSets,
    spatialSegmentationStrokeWidth,
  } = channelCoordination || {};
  return {
    spatialLayerOpacity: (spatialLayerOpacity ?? 1.0) * (spatialChannelOpacity ?? 1.0),
    // Segmentation channels use 'spatialChannelColor' for a static color,
    // whereas the points shader uses 'spatialLayerColor'.
    obsColorEncoding: obsColorEncoding === 'spatialChannelColor'
      ? 'spatialLayerColor'
      : obsColorEncoding,
    spatialLayerColor: spatialChannelColor,
    featureValueColormap,
    featureValueColormapRange,
    obsSetColor,
    obsSetSelection,
    additionalObsSets,
    // Only show the centroids of the selected obsSets.
    featureFilterMode: 'featureSelection',
    pointMarkerBorderWidth: spatialSegmentationStrokeWidth ?? CENTROID_POINT_STROKE_WIDTH,
    // The points represent the centroids of the segmentations.
    // We pass this down to the getPointsShader, to determine whether to interpret
    // `obsColorEncoding === 'geneSelection'` as a
    // quantitative color encoding or a categorical color encoding.
    pointsAreSegmentationCentroids: true,
  };
}

function toAnnotationSource(url, ngOptions, viewerDimensions) {
  return {
    url: toPrecomputedSource(url),
    subsources: {
      default: true,
    },
    enableDefaultSubsources: false,
    ...(ngOptions?.transform?.matrix
      ? {
        transform: {
          matrix: ngOptions.transform.matrix,
          // Layer-local output space; falls back to the viewer's
          // dimensions (order-independent), never another layer's.
          outputDimensions: ngOptions.transform?.outputDimensions ?? viewerDimensions,
        },
      }
      : {}),
  };
}

function getQuantitativeColorMax(ngOptions, obsColorEncoding) {
  const quantitativeColorMax = ngOptions?.quantitativeColorMax;
  if (!quantitativeColorMax && obsColorEncoding === 'geneSelection') {
    console.warn('quantitativeColorMax not specified in options — defaulting to 1.0 (no normalization)');
  }
  return quantitativeColorMax ?? 1.0;
}

/**
 * Get the parameters for NG's viewerstate.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @returns {array} [viewerstate] where
 * viewerState is an object. ref=> (https://neuroglancer-docs.web.app/json/api/index.html#json-Layer.name).
 */
/**
 * @returns [viewerState]
 */
export function useNeuroglancerViewerState(
  theme,
  showAxisLines,
  segmentationLayerScopes,
  segmentationChannelScopesByLayer,
  segmentationLayerCoordination,
  segmentationChannelCoordination,
  obsSegmentationsUrls,
  obsSegmentationsData,
  obsSegmentationsLocationsData,
  pointLayerScopes,
  pointLayerCoordination,
  obsPointsUrls,
  obsPointsData,
  pointMultiIndicesData,
  viewerDimensionsOverride = null,
  obsSegmentationsSetsData = null,
  obsSetColumnsByName = null,
) {
  const viewerState = useMemoCustomComparison(() => {
    let result = cloneDeep(DEFAULT_NG_PROPS);
    const centroidSources = getSegmentationCentroidSources({
      segmentationLayerScopes,
      segmentationChannelScopesByLayer,
      obsSegmentationsLocationsData,
    });
    // Global viewer dimensions are decided once, up front
    const viewerDimensions = resolveViewerDimensions(
      [
        ...pointLayerScopes.map(layerScope => ({
          name: toNgLayerName(DataType.OBS_POINTS, layerScope),
          neuroglancerOptions: obsPointsData?.[layerScope]?.neuroglancerOptions,
        })),
        ...centroidSources,
      ],
      viewerDimensionsOverride,
    );
    result = { ...result, dimensions: viewerDimensions };

    // ======= SEGMENTATIONS =======

    // Iterate over segmentation layers and channels.
    segmentationLayerScopes.forEach((layerScope) => {
      const layerCoordination = segmentationLayerCoordination[0][layerScope];
      const channelScopes = segmentationChannelScopesByLayer[layerScope] || [];
      const layerData = obsSegmentationsData[layerScope];
      const layerUrl = obsSegmentationsUrls[layerScope]?.[0]?.url;

      if (layerUrl && layerData) {
        const {
          spatialLayerVisible,
        } = layerCoordination || {};
        channelScopes.forEach((channelScope) => {
          const channelCoordination = segmentationChannelCoordination[0]
            ?.[layerScope]?.[channelScope];
          const {
            spatialChannelVisible,
          } = channelCoordination || {};
          const { source: ngSource, ...otherNgOptions } = layerData.neuroglancerOptions ?? {};

          // Build source: if neuroglancerOptions has subsources
          const hasNgSourceOptions = layerData.neuroglancerOptions?.subsources
            || layerData.neuroglancerOptions?.enableDefaultSubsources !== undefined;

          const source = hasNgSourceOptions
            ? {
              url: toPrecomputedSource(layerUrl),
              subsources: layerData.neuroglancerOptions.subsources,
              enableDefaultSubsources: layerData.neuroglancerOptions.enableDefaultSubsources
                  ?? false,
            }
            : toPrecomputedSource(layerUrl);

          result = {
            ...result,
            showAxisLines,
            layers: [
              ...result.layers,
              {
                type: 'segmentation',
                source,
                segments: [],
                name: toNgLayerName(DataType.OBS_SEGMENTATIONS, layerScope, channelScope),
                visible: spatialLayerVisible && spatialChannelVisible, // Both layer and channel
                // visibility must be true for the layer to be visible.
                // TODO: update this to extract specific properties from
                // neuroglancerOptions as needed.
                ...otherNgOptions,
              },
            ],
          };
        });
      }
    });

    // ======= SEGMENTATION CENTROIDS =======

    // Centroids are implicit: one annotation layer per segmentation channel
    // that has an obsLocations.ng-annotations file for its obsType.
    centroidSources.forEach(({
      layerScope, channelScope, name, url, neuroglancerOptions: ngOptions, neuroglancerInfo,
    }) => {
      const layerCoordination = segmentationLayerCoordination[0][layerScope];
      const channelCoordination = segmentationChannelCoordination[0]
        ?.[layerScope]?.[channelScope];
      const centroidShaderParams = getCentroidShaderParams(
        layerCoordination, channelCoordination,
      );
      let obsSetRules = null;
      if (centroidShaderParams.obsColorEncoding === 'cellSetSelection'
        && neuroglancerInfo && centroidShaderParams.obsSetSelection) {
        const mergedObsSets = mergeObsSets(
          obsSegmentationsSetsData?.[layerScope]?.[channelScope]?.obsSets,
          channelCoordination?.additionalObsSets,
        );
        obsSetRules = obsSetRulesFromCodes({
          columns: getObsSetAnnotationColumns(
            mergedObsSets, neuroglancerInfo, obsSetColumnsByName,
            centroidShaderParams.obsSetSelection,
          ),
          obsSets: mergedObsSets,
          selectedNamePaths: centroidShaderParams.obsSetSelection,
          cellSetColor: centroidShaderParams.obsSetColor,
          theme,
        });
      }
      const shader = getPointsShader({
        theme,
        ...centroidShaderParams,
        obsSetRules,
        quantitativeColorProp: ngOptions.quantitativeColorProp,
        quantitativeColorMax: getQuantitativeColorMax(
          ngOptions, centroidShaderParams.obsColorEncoding,
        ),
      });
      result = {
        ...result,
        layers: [
          ...result.layers,
          {
            type: 'annotation',
            source: toAnnotationSource(url, ngOptions, viewerDimensions),
            tab: 'annotations',
            shader,
            name,
            // Both layer and channel visibility must be true, as for the segmentation layer.
            visible: Boolean(layerCoordination?.spatialLayerVisible
              && channelCoordination?.spatialChannelVisible),
            projectionAnnotationSpacing: ngOptions.projectionAnnotationSpacing ?? 1.0,
          },
        ],
        selectedLayer: {
          layer: name,
        },
      };
    });

    // ======= POINTS =======

    // Iterate over point layers.
    pointLayerScopes.forEach((layerScope) => {
      const layerCoordination = pointLayerCoordination[0][layerScope];
      const layerData = obsPointsData[layerScope];
      const layerUrl = obsPointsUrls[layerScope]?.[0]?.url;
      const ngOptions = layerData?.neuroglancerOptions;

      const featureIndex = pointMultiIndicesData[layerScope]?.featureIndex;

      if (layerUrl && layerData) {
        const {
          spatialLayerVisible,
          spatialLayerOpacity,
          spatialLayerOpacityUnselected,
          obsColorEncoding,
          spatialLayerColor,
          featureSelection,
          featureFilterMode,
          featureColor,
          spatialPointStrokeWidth,
          spatialPointProjectionSpacing,
          featureValueColormap,
          featureValueColormapRange,
          spatialPointRadius,
        } = layerCoordination || {};
        const quantitativeColorMaxSelected = getQuantitativeColorMax(ngOptions, obsColorEncoding);
        // Dynamically construct the shader based on the color encoding
        // and other coordination values.
        const shader = getPointsShader({
          theme,
          featureIndex,
          spatialLayerOpacity,
          spatialLayerOpacityUnselected,
          obsColorEncoding,
          spatialLayerColor,
          featureSelection,
          featureFilterMode,
          featureColor,
          featureValueColormap,
          featureValueColormapRange,
          featureIndexProp: layerData.neuroglancerOptions?.featureIndexProp,
          pointIndexProp: layerData.neuroglancerOptions?.pointIndexProp,
          quantitativeColorProp: layerData.neuroglancerOptions?.quantitativeColorProp,
          pointMarkerBorderWidth: spatialPointStrokeWidth ?? 0.0,
          obsSets: layerCoordination.obsSets,
          obsSetColor: layerCoordination.obsSetColor,
          obsSetSelection: layerCoordination.obsSetSelection,
          additionalObsSets: layerCoordination.additionalObsSets,
          quantitativeColorMax: quantitativeColorMaxSelected,
          // spatialPointRadius is a radius (consistent with spatialSpotRadius), but NG's
          // own setPointMarkerSize expects a diameter, so double it here.
          pointMarkerSize: (spatialPointRadius ?? DEFAULT_POINT_MARKER_SIZE / 2) * 2,
        });
        result = {
          ...result,
          layers: [
            ...result.layers,
            {
              type: 'annotation',
              source: toAnnotationSource(layerUrl, ngOptions, viewerDimensions),
              tab: 'annotations',
              shader,
              name: toNgLayerName(DataType.OBS_POINTS, layerScope),
              visible: spatialLayerVisible,
              // Options from layerData.neuroglancerOptions
              // like projectionAnnotationSpacing:
              // Coordination value (LC) > file option > 1.0; clamped to NG's valid range.
              projectionAnnotationSpacing: Math.min(MAX_ANNOTATION_SPACING, Math.max(
                MIN_ANNOTATION_SPACING,
                spatialPointProjectionSpacing ?? ngOptions?.projectionAnnotationSpacing ?? 1.0,
              )),
            },
          ],

          // TODO: is this needed?
          // The selected layer here will overwrite anything
          // that was previously specified.
          selectedLayer: {
            // size: ? // TODO:  is this needed?
            layer: toNgLayerName(DataType.OBS_POINTS, layerScope),
          },
        };
      }
    });
    return result;
  }, {
    theme,
    showAxisLines,
    segmentationLayerScopes,
    segmentationChannelScopesByLayer,
    segmentationLayerCoordination,
    segmentationChannelCoordination,
    obsSegmentationsUrls,
    obsSegmentationsData,
    obsSegmentationsLocationsData,
    pointLayerScopes,
    pointLayerCoordination,
    obsPointsUrls,
    obsPointsData,
    pointMultiIndicesData,
    viewerDimensionsOverride,
    obsSegmentationsSetsData,
    obsSetColumnsByName,
  }, customIsEqualForInitialViewerState);

  return viewerState;
}
