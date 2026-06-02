import { useMemo } from 'react';
import {
  aggregateFeatureArrays,
  normalizeAggregatedFeatureArray,
  filterValidExpressionArrays,
} from '@vitessce/utils';

const DEFAULT_FEATURE_AGGREGATION_STRATEGY = 'first';

export function useAggregatedNormalizedExpressionDataForLayers({
  multiExpressionData: spotMultiExpressionData,
  layerScopes: spotLayerScopes,
  layerCoordination: spotLayerCoordination,
}) {
  const [
    spotMultiExpressionNormDataAggregated,
    spotMultiExpressionExtentsAggregated,
  ] = useMemo(() => {
    if (!spotMultiExpressionData || !spotLayerScopes?.length || !spotLayerCoordination?.[0]) {
      return [null, null];
    }
    let hasNormData = false;
    let hasExtents = false;
    const normDataByLayer = {};
    const extentsByLayer = {};

    spotLayerScopes.forEach((layerScope) => {
      const expressionData = spotMultiExpressionData[layerScope];
      const validExpressionArrays = filterValidExpressionArrays(expressionData);
      if (validExpressionArrays.length <= 1) {
        return;
      }
      const strategy = spotLayerCoordination?.[0]?.[layerScope]?.featureAggregationStrategy
        ?? DEFAULT_FEATURE_AGGREGATION_STRATEGY;
      if (strategy == null) {
        return;
      }
      const aggregated = aggregateFeatureArrays(validExpressionArrays, strategy);
      if (!aggregated) {
        return;
      }
      const normalized = normalizeAggregatedFeatureArray(aggregated);
      if (!normalized) {
        return;
      }
      normDataByLayer[layerScope] = [normalized.normData];
      extentsByLayer[layerScope] = [normalized.extent];
      hasNormData = true;
      hasExtents = true;
    });

    return [
      hasNormData ? normDataByLayer : null,
      hasExtents ? extentsByLayer : null,
    ];
  }, [spotMultiExpressionData, spotLayerScopes, spotLayerCoordination]);

  return [
    spotMultiExpressionNormDataAggregated,
    spotMultiExpressionExtentsAggregated,
  ];
}

export function useAggregatedNormalizedExpressionDataForChannels({
  multiExpressionData: segmentationMultiExpressionData,
  layerScopes: segmentationLayerScopes,
  channelScopesByLayer: segmentationChannelScopesByLayer,
  channelCoordination: segmentationChannelCoordination,
}) {
  const [
    segmentationMultiExpressionNormDataAggregated,
    segmentationMultiExpressionExtentsAggregated,
  ] = useMemo(() => {
    if (!segmentationMultiExpressionData
      || !segmentationLayerScopes?.length
      || !segmentationChannelScopesByLayer
      || !segmentationChannelCoordination?.[0]) {
      return [null, null];
    }
    let hasNormData = false;
    let hasExtents = false;
    const normDataByLayer = {};
    const extentsByLayer = {};

    segmentationLayerScopes.forEach((layerScope) => {
      const channelScopes = segmentationChannelScopesByLayer?.[layerScope];
      if (!channelScopes?.length) {
        return;
      }
      channelScopes.forEach((channelScope) => {
        const expressionData = segmentationMultiExpressionData[layerScope]?.[channelScope];
        const validExpressionArrays = filterValidExpressionArrays(expressionData);
        if (validExpressionArrays.length <= 1) {
          return;
        }
        const strategy = segmentationChannelCoordination
          ?.[0]?.[layerScope]?.[channelScope]?.featureAggregationStrategy
           ?? DEFAULT_FEATURE_AGGREGATION_STRATEGY;
        if (strategy == null) {
          return;
        }
        const aggregated = aggregateFeatureArrays(validExpressionArrays, strategy);
        if (!aggregated) {
          return;
        }
        const normalized = normalizeAggregatedFeatureArray(aggregated);
        if (!normalized) {
          return;
        }
        if (!normDataByLayer[layerScope]) {
          normDataByLayer[layerScope] = {};
        }
        if (!extentsByLayer[layerScope]) {
          extentsByLayer[layerScope] = {};
        }
        normDataByLayer[layerScope][channelScope] = [normalized.normData];
        extentsByLayer[layerScope][channelScope] = [normalized.extent];
        hasNormData = true;
        hasExtents = true;
      });
    });

    return [
      hasNormData ? normDataByLayer : null,
      hasExtents ? extentsByLayer : null,
    ];
  }, [segmentationMultiExpressionData, segmentationLayerScopes,
    segmentationChannelScopesByLayer, segmentationChannelCoordination,
  ]);

  return [
    segmentationMultiExpressionNormDataAggregated,
    segmentationMultiExpressionExtentsAggregated,
  ];
}
