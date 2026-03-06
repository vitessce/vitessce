import { useMemo } from 'react';
import { DataType } from '@vitessce/constants-internal';
import { cloneDeep } from 'lodash-es';
import { useMemoCustomComparison, customIsEqualForInitialViewerState } from './use-memo-custom-comparison.js';
import { getPointsShader } from './shader-utils.js';


export const DEFAULT_NG_PROPS = {
  layout: '3d',
  position: [0, 0, 0],
  projectionOrientation: [0, 0, 0, 1],
  projectionScale: 1024,
  crossSectionScale: 1,
  dimensions: {
    x: [1, 'nm'],
    y: [1, 'nm'],
    z: [1, 'nm'],
  },
  layers: [],
};

function toPrecomputedSource(url) {
  if (!url) {
    throw new Error('toPrecomputedSource: URL is required');
  }
  return `precomputed://${url}`;
}

const UNIT_TO_NM = {
  nm: 1,
  um: 1e3,
  µm: 1e3,
  mm: 1e6,
  cm: 1e7,
  m: 1e9,
};


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
function normalizeDimensionsToNanometers(opts) {
  const { dimensionUnit, dimensionX, dimensionY, dimensionZ, ...otherOptions } = opts;

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
) {
  const viewerState = useMemoCustomComparison(() => {
    let result = cloneDeep(DEFAULT_NG_PROPS);

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
          const channelCoordination = segmentationChannelCoordination[0][layerScope][channelScope];
          const {
            spatialChannelVisible,
          } = channelCoordination || {};
          console.log(spatialLayerVisible, spatialChannelVisible);
          result = {
            ...result,
            layers: [
              ...result.layers,
              {
                type: 'segmentation',
                source: toPrecomputedSource(layerUrl),
                segments: [],
                name: toNgLayerName(DataType.OBS_SEGMENTATIONS, layerScope, channelScope),
                visible: spatialLayerVisible && spatialChannelVisible, // Both layer and channel visibility must be true for the layer to be visible.
                // TODO: update this to extract specific properties from neuroglancerOptions as needed.
                ...(layerData.neuroglancerOptions ?? {}),
              },
            ],
          };
        });

        /*
        result = {
          ...result,
          // The coordinate system options (e.g., position, projectionScale)
          // provided for this layer will take precedence over whatever is currently in result.
          // TODO: do not do any position/coordinate system logic here. Do it all via derivedViewerState.
          // Otherwise, derivedViewerState does not know which values were initial vs. from user interactions.
          ...normalizeDimensionsToNanometers(layerData.neuroglancerOptions),
        };
        */
      }
    });

    // ======= POINTS =======

    // Iterate over point layers.
    pointLayerScopes.forEach((layerScope) => {
      const layerCoordination = pointLayerCoordination[0][layerScope];
      const layerData = obsPointsData[layerScope];
      const layerUrl = obsPointsUrls[layerScope]?.[0]?.url;

      const featureIndex = pointMultiIndicesData[layerScope]?.featureIndex;

      if (layerUrl && layerData) {
        const {
          spatialLayerVisible,
          spatialLayerOpacity,
          obsColorEncoding,
          spatialLayerColor,
          featureSelection,
          featureFilterMode,
          featureColor,
        } = layerCoordination || {};

        // Dynamically construct the shader based on the color encoding and other coordination values.
        const shader = getPointsShader({
          theme,
          featureIndex,
          spatialLayerOpacity,
          obsColorEncoding,
          spatialLayerColor,
          featureSelection,
          featureFilterMode,
          featureColor,

          featureIndexProp: layerData.neuroglancerOptions?.featureIndexProp,
          pointIndexProp: layerData.neuroglancerOptions?.pointIndexProp,
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
              },
              tab: 'annotations',
              shader,
              name: toNgLayerName(DataType.OBS_POINTS, layerScope),
              visible: spatialLayerVisible,
              // Options from layerData.neuroglancerOptions like projectionAnnotationSpacing:
              projectionAnnotationSpacing: layerData.neuroglancerOptions?.projectionAnnotationSpacing ?? 1.0,
            },
          ],

          // TODO: is this needed?
          // The selected layer here will overwrite anything that was previously specified.
          selectedLayer: {
            // size: ? // TODO:  is this needed?
            layer: toNgLayerName(DataType.OBS_POINTS, layerScope),
          },
        };
      }
    });
    console.log('Recomputed initialViewerState');
    return result;
  }, {
    theme,
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
  }, customIsEqualForInitialViewerState);

  return viewerState;
}
