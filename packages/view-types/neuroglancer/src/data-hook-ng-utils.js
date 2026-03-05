import { useMemo } from 'react';
import { DataType } from '@vitessce/constants-internal';
import { cloneDeep } from 'lodash-es';
import { useMemoCustomComparison, customIsEqualForInitialViewerState } from './use-memo-custom-comparison.js';


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
    ...otherOptions
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
              },
            ],
          };
        });

        result = {
          ...result,
          // The coordinate system options (e.g., position, projectionScale)
          // provided for this layer will take precedence over whatever is currently in result.
          ...normalizeDimensionsToNanometers(layerData.neuroglancerOptions),
        };
      }
    });

    // ======= POINTS =======

    // Iterate over point layers.
    pointLayerScopes.forEach((layerScope) => {
      const layerCoordination = pointLayerCoordination[0][layerScope];
      const layerData = obsPointsData[layerScope];
      const layerUrl = obsPointsUrls[layerScope]?.[0]?.url;
      
      if (layerUrl && layerData) {
        const {
          spatialLayerVisible,
        } = layerCoordination || {};
        result = {
          ...result,
          layers: [
            ...result.layers,
            {
              type: "annotation",
              source: {
                url: toPrecomputedSource(layerUrl),
                subsources: {
                  default: true
                },
                enableDefaultSubsources: false
              },
              tab: "annotations",
              projectionAnnotationSpacing: 2.4544585683772735, // TODO: pass via fileDef.options or coordination space?
              // TODO: dynamically construct the shader.
              shader: "void main() {\n    int gene = prop_gene();\n    const vec3 tab10[10] = vec3[10](\n        vec3(0.121, 0.466, 0.705), // blue\n        vec3(1.000, 0.498, 0.054), // orange\n        vec3(0.172, 0.627, 0.172), // green\n        vec3(0.839, 0.153, 0.157), // red\n        vec3(0.580, 0.404, 0.741), // purple\n        vec3(0.549, 0.337, 0.294), // brown\n        vec3(0.890, 0.467, 0.761), // pink\n        vec3(0.498, 0.498, 0.498), // gray\n        vec3(0.737, 0.741, 0.133), // olive\n        vec3(0.090, 0.745, 0.811)  // cyan\n    );\n    vec4 color = vec4(0.925, 0.925, 0.925, 0.0); // Default: fully transparent\n\tconst int gene_ids[10] = int[10](1, 2, 15, 32, 42, 33, 47, 49, 130, 200);\n    for (int i = 0; i < 10; ++i) {\n        if (gene == gene_ids[i]) {\n            color = vec4(tab10[i], 1.0);\n        }\n    }\n\n    if (color.a < 0.01) {\n        discard; // Don't render this fragment at all\n    }\n\n    setColor(color);\n}",
              name:  toNgLayerName(DataType.OBS_POINTS, layerScope),
              visible: spatialLayerVisible,
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
    console.log("Recomputed initialViewerState");
    return result;
  }, {
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
  }, customIsEqualForInitialViewerState);

  return viewerState;
}
