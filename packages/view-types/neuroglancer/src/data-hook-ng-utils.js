import { DataType } from '@vitessce/constants-internal';
import { cloneDeep, isEqual } from 'lodash-es';
import { useMemoCustomComparison } from '@vitessce/vit-s';
import { customIsEqualForInitialViewerState } from './use-memo-custom-equals.js';
import { getPointsShader } from './shader-utils.js';


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
 */
export function resolveViewerDimensions(
  pointLayerScopes, obsPointsData, viewerDimensionsOverride = null,
) {
  if (viewerDimensionsOverride != null) {
    if (isValidNgDimensions(viewerDimensionsOverride)) return viewerDimensionsOverride;
    console.warn('Ignoring invalid viewerDimensions prop; expected { x: [scale, unit], y: [scale, unit], z: [scale, unit] }.');
  }
  const declared = (pointLayerScopes ?? [])
    .map(scope => ({
      scope,
      dims: obsPointsData?.[scope]?.neuroglancerOptions?.transform?.outputDimensions,
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
  throw new Error(`Unsupported data type: ${dataType}`);
}

/**
 * Return the segmentation layer scopes that have at least one channel whose
 * obsType matches the given point layer obsType. A non-empty result means
 * the point layer is interpreted as the centroids of those segmentations;
 * an empty result means it is a standalone point layer (e.g., transcripts).
 */
export function getMatchingSegmentationLayerScopes({
  pointObsType,
  segmentationLayerScopes,
  segmentationChannelScopesByLayer,
  segmentationChannelCoordination,
}) {
  if (!pointObsType) return [];
  return (segmentationLayerScopes ?? []).filter((segmentationLayerScope) => {
    const segmentationChannelScopes = segmentationChannelScopesByLayer?.
      [segmentationLayerScope] || [];
    return segmentationChannelScopes.some((segmentationChannelScope) => {
      const segmentationObsType = segmentationChannelCoordination?.[0]
        ?.[segmentationLayerScope]?.[segmentationChannelScope]?.obsType;
      return segmentationObsType === pointObsType;
    });
  });
}

export function pointsHaveMatchingSegmentation(args) {
  // Check if there are segmentations with the same obsType.
  // If so, infer that the points represent centroids of the segmentations.
  // We pass this down to the getPointsShader, to determine whether to
  // interpret `obsColorEncoding === 'geneSelection'` as a quantitative
  // color encoding or a categorical color encoding.
  return getMatchingSegmentationLayerScopes(args).length > 0;
}

/**
 * Split point layer scopes into centroid layers (obsType matches a
 * segmentation channel) and standalone layers (e.g., transcripts).
 * @returns {{
 *   centroidScopes: string[],
 *   transcriptScopes: string[],
 *   centroidToSegLayers: Record<string, string[]>,
 *   culledSegLayerScopes: Set<string>,
 * }}
 */
export function classifyPointLayers({
  pointLayerScopes,
  pointLayerCoordination,
  segmentationLayerScopes,
  segmentationChannelScopesByLayer,
  segmentationChannelCoordination,
}) {
  const centroidScopes = [];
  const transcriptScopes = [];
  const centroidToSegLayers = {};
  (pointLayerScopes ?? []).forEach((pointLayerScope) => {
    const matches = getMatchingSegmentationLayerScopes({
      pointObsType: pointLayerCoordination?.[0]?.[pointLayerScope]?.obsType,
      segmentationLayerScopes,
      segmentationChannelScopesByLayer,
      segmentationChannelCoordination,
    });
    if (matches.length > 0) {
      centroidScopes.push(pointLayerScope);
      centroidToSegLayers[pointLayerScope] = matches;
    } else {
      transcriptScopes.push(pointLayerScope);
    }
  });
  return {
    centroidScopes,
    transcriptScopes,
    centroidToSegLayers,
    culledSegLayerScopes: new Set(Object.values(centroidToSegLayers).flat()),
  };
}

export function segmentationsHaveMatchingPoints({
  segmentationObsType,
  pointLayerScopes,
  pointLayerCoordination,
}) {
  // Check if there are points with the same obsType.
  // If so, we infer that the segmentations have matching points.
  return pointLayerScopes.some((pointLayerScope) => {
    const pointObsType = pointLayerCoordination?.
      [0]?.[pointLayerScope]?.obsType;
    return (
      segmentationObsType && pointObsType
      && segmentationObsType === pointObsType
    );
  });
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
  pointLayerScopes,
  pointLayerCoordination,
  obsPointsUrls,
  obsPointsData,
  pointMultiIndicesData,
  viewerDimensionsOverride = null,
) {
  const viewerState = useMemoCustomComparison(() => {
    let result = cloneDeep(DEFAULT_NG_PROPS);
    // Global viewer dimensions are decided once, up front
    const viewerDimensions = resolveViewerDimensions(
      pointLayerScopes, obsPointsData, viewerDimensionsOverride,
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
            showDefaultAnnotations: false, // this removes the yellow box around pointsLayer
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

    // ======= POINTS =======

    // Iterate over point layers.
    pointLayerScopes.forEach((layerScope) => {
      const layerCoordination = pointLayerCoordination[0][layerScope];
      const layerData = obsPointsData[layerScope];
      const layerUrl = obsPointsUrls[layerScope]?.[0]?.url;
      const ngOptions = layerData?.neuroglancerOptions;

      // Check if there are segmentations with the same obsType.
      // If so, we infer that the points represent the centroids of the segmentations.
      // We pass this down to the getPointsShader, to determine whether to interpret
      // `obsColorEncoding === 'geneSelection'` as a
      // quantitative color encoding or a categorical color encoding.
      const pointsAreSegmentationCentroids = pointsHaveMatchingSegmentation({
        pointObsType: layerCoordination?.obsType,
        segmentationLayerScopes,
        segmentationChannelScopesByLayer,
        segmentationChannelCoordination,
      });

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
          featureValueColormap,
          featureValueColormapRange,
        } = layerCoordination || {};
        const quantitativeColorMax = layerData.neuroglancerOptions?.quantitativeColorMax;
        if (!quantitativeColorMax && obsColorEncoding === 'geneSelection') {
          console.warn('quantitativeColorMax not specified in options — defaulting to 1.0 (no normalization)');
        }
        const quantitativeColorMaxSelected = quantitativeColorMax ?? 1.0;
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
          pointsAreSegmentationCentroids,
        });
        result = {
          ...result,
          layers: [
            ...result.layers,
            {
              type: 'annotation',
              source: {
                url: toPrecomputedSource(layerUrl),
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
              },
              tab: 'annotations',
              shader,
              name: toNgLayerName(DataType.OBS_POINTS, layerScope),
              visible: spatialLayerVisible,
              // Options from layerData.neuroglancerOptions
              // like projectionAnnotationSpacing:
              projectionAnnotationSpacing: ngOptions?.projectionAnnotationSpacing ?? 1.0,
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
    pointLayerScopes,
    pointLayerCoordination,
    obsPointsUrls,
    obsPointsData,
    pointMultiIndicesData,
    viewerDimensionsOverride,
  }, customIsEqualForInitialViewerState);

  return viewerState;
}