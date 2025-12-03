import React, { useMemo } from 'react';
import { makeStyles } from '@vitessce/styles';
import Legend from './Legend.js';
import type { ThemeType, SegmentationLayerCoordinationValues,
  SegmentationChannelCoordinationValues, SegmentationChannelSetters,
  SpotLayerCoordinationValues, SpotLayerSetters, FeatureLabelsData,
  PointLayerCoordinationValues, PointLayerSetters } from './types.js';


const useStyles = makeStyles()(() => ({
  multiLegend: {
    position: 'absolute',
    top: '0px',
    right: '0px',
  },
}));


interface MultiLegendProps {
  theme?: ThemeType;
  maxHeight?: number;
  // Segmentations
  segmentationLayerScopes?: string[];
  segmentationLayerCoordination?: [Record<string, SegmentationLayerCoordinationValues>];
  segmentationChannelScopesByLayer?: Record<string, string[]>;
  segmentationChannelCoordination?: [
    Record<string, Record<string, SegmentationChannelCoordinationValues>>,
    Record<string, Record<string, SegmentationChannelSetters>>?,
  ];
  segmentationMultiExpressionExtents?: Record<string, Record<string, [number, number][]>>;
  // Spots
  spotLayerScopes?: string[];
  spotLayerCoordination?: [
    Record<string, SpotLayerCoordinationValues>,
    Record<string, SpotLayerSetters>?,
  ];
  spotMultiExpressionExtents?: Record<string, [number, number][]>;
  spotMultiFeatureLabels?: Record<string, FeatureLabelsData>;
  // Points
  pointLayerScopes?: string[];
  pointLayerCoordination?: [
    Record<string, PointLayerCoordinationValues>,
    Record<string, PointLayerSetters>?,
  ];
}

export default function MultiLegend(props: MultiLegendProps) {
  const {
    theme,
    maxHeight,
    // Segmentations
    segmentationLayerScopes,
    segmentationLayerCoordination,
    segmentationChannelScopesByLayer,
    segmentationChannelCoordination,
    segmentationMultiExpressionExtents,
    // Spots
    spotLayerScopes,
    spotLayerCoordination,
    spotMultiExpressionExtents,
    spotMultiFeatureLabels,
    // Points
    pointLayerScopes,
    pointLayerCoordination,
  } = props;

  const { classes } = useStyles();

  const reversedSegmentationLayerScopes = useMemo(() => (
    [...(segmentationLayerScopes || [])].reverse()
  ), [segmentationLayerScopes]);
  const reversedSpotLayerScopes = useMemo(() => (
    [...(spotLayerScopes || [])].reverse()
  ), [spotLayerScopes]);
  const reversedPointLayerScopes = useMemo(() => (
    [...(pointLayerScopes || [])].reverse()
  ), [pointLayerScopes]);

  return (
    <div className={classes.multiLegend}>
      {/* Points */}
      {pointLayerScopes ? reversedPointLayerScopes.flatMap((layerScope) => {
        const layerCoordination = pointLayerCoordination?.[0]?.[layerScope];
        const layerSetters = pointLayerCoordination?.[1]?.[layerScope];

        if (!layerCoordination) return null;

        const {
          spatialLayerVisible,
          obsColorEncoding,
          obsType,
          featureType,
          featureValueType,
          featureSelection,
          featureValueColormap,
          featureValueColormapRange,
          spatialLayerColor,
          legendVisible,
        } = layerCoordination;

        const { setFeatureValueColormapRange } = layerSetters || {};

        const isStaticColor = obsColorEncoding === 'spatialLayerColor';
        const height = isStaticColor ? 20 : 36;

        return spatialLayerVisible && legendVisible ? (
          <Legend
            key={layerScope}
            maxHeight={maxHeight}
            positionRelative
            highContrast
            showObsLabel
            visible={spatialLayerVisible}
            theme={theme}
            obsType={obsType}
            featureType={featureType}
            featureValueType={featureValueType}
            obsColorEncoding={obsColorEncoding}
            spatialLayerColor={spatialLayerColor}
            featureSelection={featureSelection}
            // featureLabelsMap={featureLabelsMap} // TODO
            featureValueColormap={featureValueColormap || 'viridis'}
            featureValueColormapRange={featureValueColormapRange || [0, 1]}
            setFeatureValueColormapRange={setFeatureValueColormapRange}
            extent={null}
            height={height}
          />
        ) : null;
      }) : null}
      {/* Spots */}
      {spotLayerScopes ? reversedSpotLayerScopes.flatMap((layerScope) => {
        const layerCoordination = spotLayerCoordination?.[0][layerScope];
        const layerSetters = spotLayerCoordination?.[1]?.[layerScope];

        if (!layerCoordination) return null;

        const {
          spatialLayerVisible,
          obsColorEncoding,
          featureValueColormap,
          featureValueColormapRange,
          obsType,
          featureType,
          featureValueType,
          featureSelection,
          featureAggregationStrategy,
          spatialLayerColor,
          legendVisible,
          obsSetSelection,
          obsSetColor,
        } = layerCoordination;

        const { setFeatureValueColormapRange } = layerSetters || {};

        const expressionExtents = spotMultiExpressionExtents?.[layerScope];
        // There can potentially be multiple features/genes selected, but we
        // are only using the first one for now here.
        const firstExpressionExtent = expressionExtents?.[0];

        const isStaticColor = obsColorEncoding === 'spatialLayerColor';
        const height = isStaticColor ? 20 : 36;

        const featureLabelsMap = spotMultiFeatureLabels?.[layerScope]?.featureLabelsMap;

        return spatialLayerVisible && legendVisible ? (
          <Legend
            key={layerScope}
            maxHeight={maxHeight}
            positionRelative
            highContrast
            showObsLabel
            visible={spatialLayerVisible}
            theme={theme}
            obsType={obsType}
            featureType={featureType}
            featureValueType={featureValueType}
            obsColorEncoding={obsColorEncoding}
            spatialLayerColor={spatialLayerColor}
            featureSelection={featureSelection}
            featureAggregationStrategy={featureAggregationStrategy}
            featureLabelsMap={featureLabelsMap}
            featureValueColormap={featureValueColormap}
            featureValueColormapRange={featureValueColormapRange}
            setFeatureValueColormapRange={setFeatureValueColormapRange}
            extent={firstExpressionExtent}
            height={height}
            obsSetSelection={obsSetSelection}
            obsSetColor={obsSetColor}
          />
        ) : null;
      }) : null}
      {/* Segmentations */}
      {segmentationLayerScopes ? reversedSegmentationLayerScopes.flatMap((layerScope) => {
        const layerCoordination = segmentationLayerCoordination?.[0][layerScope];
        const channelScopes = segmentationChannelScopesByLayer?.[layerScope];
        const channelCoordination = segmentationChannelCoordination?.[0][layerScope];
        const channelSetters = segmentationChannelCoordination?.[1]?.[layerScope];

        if (!layerCoordination) return null;

        const {
          spatialLayerVisible,
        } = layerCoordination;

        const reversedChannelScopes = [...(channelScopes || [])].reverse();

        return (channelCoordination && channelScopes ? reversedChannelScopes.map((cScope) => {
          const {
            spatialChannelVisible,
            spatialChannelColor,
            obsColorEncoding,
            featureValueColormap,
            featureValueColormapRange,
            obsType,
            featureType,
            featureValueType,
            featureSelection,
            featureAggregationStrategy,
            legendVisible,
            obsSetSelection,
            obsSetColor,
          } = channelCoordination[cScope];
          const { setFeatureValueColormapRange } = channelSetters?.[cScope] || {};
          const expressionExtents = segmentationMultiExpressionExtents?.[layerScope]?.[cScope];
          // There can potentially be multiple features/genes selected, but we
          // are only using the first one for now here.
          const firstExpressionExtent = expressionExtents?.[0];
          const isStaticColor = obsColorEncoding === 'spatialChannelColor';
          const height = isStaticColor ? 20 : 36;

          return spatialLayerVisible && spatialChannelVisible && legendVisible ? (
            <Legend
              key={`${layerScope}-${cScope}`}
              maxHeight={maxHeight}
              positionRelative
              highContrast
              showObsLabel
              visible={spatialLayerVisible && spatialChannelVisible}
              theme={theme}
              obsType={obsType}
              featureType={featureType}
              featureValueType={featureValueType}
              obsColorEncoding={obsColorEncoding}
              featureSelection={featureSelection}
              featureAggregationStrategy={featureAggregationStrategy}
              // featureLabelsMap={featureLabelsMap} // TODO
              featureValueColormap={featureValueColormap}
              featureValueColormapRange={featureValueColormapRange}
              setFeatureValueColormapRange={setFeatureValueColormapRange}
              extent={firstExpressionExtent}
              height={height}

              spatialChannelColor={spatialChannelColor}
              obsSetSelection={obsSetSelection}
              obsSetColor={obsSetColor}
            />
          ) : null;
        }) : null);
      }) : null}
    </div>
  );
}
