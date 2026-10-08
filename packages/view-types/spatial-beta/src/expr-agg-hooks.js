import { useMemo } from 'react';
import {
  aggregateFeatureArrays,
  normalizeAggregatedFeatureArray,
  filterValidExpressionArrays,
  resolveFeatureAggregationStrategy,
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
 * Aggregate the expression arrays for a single
 * layer or channel according to its featureAggregationStrategy.
 * @param {(null|number[]|Float32Array)[]} data Per-feature raw arrays.
 * Strategies that combine features (sum, mean, difference) operate on these,
 * so that the result (and its extent) is in the units of the raw values.
 * @param {(null|Uint8Array)[]} normData Per-feature normalized arrays,
 * used directly for strategies that select a single feature.
 * @param {([number, number]|null)[]} extents Per-feature extents.
 * @param {string|number|null} strategy The featureAggregationStrategy value.
 * @param {string[]|null} featureSelection The featureSelection value,
 * used to resolve a strategy that refers to a feature by name.
 * @returns {{ normData: Uint8Array[], extents: [number, number][] }|null}
 * Single-element arrays to use in place of the per-feature arrays,
 * or null if no aggregation is necessary.
 */
export function aggregateExpressionForScope(data, normData, extents, strategy, featureSelection) {
  if (!Array.isArray(normData) || normData.length <= 1) {
    return null;
  }
  const strategyToUse = resolveFeatureAggregationStrategy(strategy, featureSelection)
    ?? DEFAULT_FEATURE_AGGREGATION_STRATEGY;

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

  // Combine the raw values rather than the normalized values,
  // since each feature was normalized relative to its own extent.
  if (!Array.isArray(data) || !data.every(isValidExpressionArray)) {
    // Wait for all features to finish loading, so that we do not
    // combine a subset of the features (e.g., the wrong pair for difference).
    return null;
  }
  const aggregated = aggregateFeatureArrays(data, strategyToUse);
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
  multiExpressionNormData: spotMultiExpressionNormData,
  multiExpressionExtents: spotMultiExpressionExtents,
  layerScopes: spotLayerScopes,
  layerCoordination: spotLayerCoordination,
}) {
  return useMemo(() => {
    if (!spotMultiExpressionNormData || !spotLayerScopes?.length || !spotLayerCoordination?.[0]) {
      return [spotMultiExpressionNormData, spotMultiExpressionExtents];
    }
    // Start from the non-aggregated values so that layers
    // which do not require aggregation retain their data.
    const normDataByLayer = { ...spotMultiExpressionNormData };
    const extentsByLayer = { ...spotMultiExpressionExtents };

    spotLayerScopes.forEach((layerScope) => {
      const {
        featureAggregationStrategy,
        featureSelection,
      } = spotLayerCoordination[0][layerScope] || {};
      const result = aggregateExpressionForScope(
        spotMultiExpressionData?.[layerScope],
        spotMultiExpressionNormData[layerScope],
        spotMultiExpressionExtents?.[layerScope],
        featureAggregationStrategy,
        featureSelection,
      );
      if (result) {
        normDataByLayer[layerScope] = result.normData;
        extentsByLayer[layerScope] = result.extents;
      }
    });

    return [normDataByLayer, extentsByLayer];
  }, [spotMultiExpressionData, spotMultiExpressionNormData, spotMultiExpressionExtents,
    spotLayerScopes, spotLayerCoordination,
  ]);
}

export function useAggregatedNormalizedExpressionDataForChannels({
  multiExpressionData: segmentationMultiExpressionData,
  multiExpressionNormData: segmentationMultiExpressionNormData,
  multiExpressionExtents: segmentationMultiExpressionExtents,
  layerScopes: segmentationLayerScopes,
  channelScopesByLayer: segmentationChannelScopesByLayer,
  channelCoordination: segmentationChannelCoordination,
}) {
  return useMemo(() => {
    if (!segmentationMultiExpressionNormData
      || !segmentationLayerScopes?.length
      || !segmentationChannelScopesByLayer
      || !segmentationChannelCoordination?.[0]) {
      return [segmentationMultiExpressionNormData, segmentationMultiExpressionExtents];
    }
    // Start from the non-aggregated values so that channels
    // which do not require aggregation retain their data.
    const normDataByLayer = { ...segmentationMultiExpressionNormData };
    const extentsByLayer = { ...segmentationMultiExpressionExtents };

    segmentationLayerScopes.forEach((layerScope) => {
      const channelScopes = segmentationChannelScopesByLayer[layerScope];
      channelScopes?.forEach((channelScope) => {
        const {
          featureAggregationStrategy,
          featureSelection,
        } = segmentationChannelCoordination[0][layerScope]?.[channelScope] || {};
        const result = aggregateExpressionForScope(
          segmentationMultiExpressionData?.[layerScope]?.[channelScope],
          segmentationMultiExpressionNormData[layerScope]?.[channelScope],
          segmentationMultiExpressionExtents?.[layerScope]?.[channelScope],
          featureAggregationStrategy,
          featureSelection,
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
  }, [segmentationMultiExpressionData, segmentationMultiExpressionNormData,
    segmentationMultiExpressionExtents,
    segmentationLayerScopes, segmentationChannelScopesByLayer,
    segmentationChannelCoordination,
  ]);
}
