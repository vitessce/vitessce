import { useMemo } from 'react';
import {
  aggregateFeatureArrays,
  normalizeAggregatedFeatureArray,
  filterValidExpressionArrays,
} from '@vitessce/utils';

const DEFAULT_FEATURE_AGGREGATION_STRATEGY = 'first';

function isValidExpressionArray(arr) {
  return filterValidExpressionArrays([arr]).length === 1;
}

/**
 * Get the index of a single feature to use, for strategies
 * that select one feature rather than combining several.
 * @param {string|number} strategy The featureAggregationStrategy value.
 * @param {number} numFeatures The number of selected features.
 * @returns {number|null} The feature index, or null if the strategy
 * combines multiple features (e.g., sum, mean, difference).
 */
function getSingleFeatureIndex(strategy, numFeatures) {
  if (strategy === 'first') {
    return 0;
  }
  if (strategy === 'last') {
    return numFeatures - 1;
  }
  if (typeof strategy === 'number') {
    // Fall back to the first feature when the index is out of bounds,
    // for example after features were removed from the featureSelection.
    return (strategy >= 0 && strategy < numFeatures) ? strategy : 0;
  }
  return null;
}

/**
 * Aggregate the (normalized) expression arrays for a single
 * layer or channel according to its featureAggregationStrategy.
 * @param {(null|Uint8Array)[]} normData Per-feature normalized arrays.
 * @param {([number, number]|null)[]} extents Per-feature extents.
 * @param {string|number|null} strategy The featureAggregationStrategy value.
 * @returns {{ normData: Uint8Array[], extents: [number, number][] }|null}
 * Single-element arrays to use in place of the per-feature arrays,
 * or null if no aggregation is necessary.
 */
export function aggregateExpressionForScope(normData, extents, strategy) {
  if (!Array.isArray(normData) || normData.length <= 1) {
    return null;
  }
  const strategyToUse = strategy ?? DEFAULT_FEATURE_AGGREGATION_STRATEGY;

  const featureIndex = getSingleFeatureIndex(strategyToUse, normData.length);
  if (featureIndex !== null) {
    // Index into the unfiltered arrays so that the index
    // corresponds to the position in the featureSelection.
    const selectedNormData = normData[featureIndex];
    if (!isValidExpressionArray(selectedNormData)) {
      // The selected feature has not finished loading.
      return null;
    }
    // Use the original extent so that the legend shows
    // the range of the raw (non-normalized) values.
    return {
      normData: [selectedNormData],
      extents: [extents?.[featureIndex] ?? null],
    };
  }

  const validExpressionArrays = filterValidExpressionArrays(normData);
  if (validExpressionArrays.length <= 1) {
    return null;
  }
  const aggregated = aggregateFeatureArrays(validExpressionArrays, strategyToUse);
  const normalized = normalizeAggregatedFeatureArray(aggregated);
  if (!normalized) {
    return null;
  }
  return {
    normData: [normalized.normData],
    extents: [normalized.extent],
  };
}

export function useAggregatedNormalizedExpressionDataForLayers({
  multiExpressionData: spotMultiExpressionData,
  multiExpressionExtents: spotMultiExpressionExtents,
  layerScopes: spotLayerScopes,
  layerCoordination: spotLayerCoordination,
}) {
  return useMemo(() => {
    if (!spotMultiExpressionData || !spotLayerScopes?.length || !spotLayerCoordination?.[0]) {
      return [spotMultiExpressionData, spotMultiExpressionExtents];
    }
    // Start from the non-aggregated values so that layers
    // which do not require aggregation retain their data.
    const normDataByLayer = { ...spotMultiExpressionData };
    const extentsByLayer = { ...spotMultiExpressionExtents };

    spotLayerScopes.forEach((layerScope) => {
      const strategy = spotLayerCoordination[0][layerScope]?.featureAggregationStrategy;
      const result = aggregateExpressionForScope(
        spotMultiExpressionData[layerScope],
        spotMultiExpressionExtents?.[layerScope],
        strategy,
      );
      if (result) {
        normDataByLayer[layerScope] = result.normData;
        extentsByLayer[layerScope] = result.extents;
      }
    });

    return [normDataByLayer, extentsByLayer];
  }, [spotMultiExpressionData, spotMultiExpressionExtents,
    spotLayerScopes, spotLayerCoordination,
  ]);
}

export function useAggregatedNormalizedExpressionDataForChannels({
  multiExpressionData: segmentationMultiExpressionData,
  multiExpressionExtents: segmentationMultiExpressionExtents,
  layerScopes: segmentationLayerScopes,
  channelScopesByLayer: segmentationChannelScopesByLayer,
  channelCoordination: segmentationChannelCoordination,
}) {
  return useMemo(() => {
    if (!segmentationMultiExpressionData
      || !segmentationLayerScopes?.length
      || !segmentationChannelScopesByLayer
      || !segmentationChannelCoordination?.[0]) {
      return [segmentationMultiExpressionData, segmentationMultiExpressionExtents];
    }
    // Start from the non-aggregated values so that channels
    // which do not require aggregation retain their data.
    const normDataByLayer = { ...segmentationMultiExpressionData };
    const extentsByLayer = { ...segmentationMultiExpressionExtents };

    segmentationLayerScopes.forEach((layerScope) => {
      const channelScopes = segmentationChannelScopesByLayer[layerScope];
      channelScopes?.forEach((channelScope) => {
        const strategy = segmentationChannelCoordination[0][layerScope]?.[channelScope]
          ?.featureAggregationStrategy;
        const result = aggregateExpressionForScope(
          segmentationMultiExpressionData[layerScope]?.[channelScope],
          segmentationMultiExpressionExtents?.[layerScope]?.[channelScope],
          strategy,
        );
        if (result) {
          normDataByLayer[layerScope] = {
            ...normDataByLayer[layerScope],
            [channelScope]: result.normData,
          };
          extentsByLayer[layerScope] = {
            ...extentsByLayer[layerScope],
            [channelScope]: result.extents,
          };
        }
      });
    });

    return [normDataByLayer, extentsByLayer];
  }, [segmentationMultiExpressionData, segmentationMultiExpressionExtents,
    segmentationLayerScopes, segmentationChannelScopesByLayer,
    segmentationChannelCoordination,
  ]);
}
