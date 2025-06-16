import React, { useMemo } from 'react';
import { makeStyles } from '@vitessce/styles';
import Legend from './Legend.js';


const useStyles = makeStyles()(() => ({
  multiLegend: {
    position: 'absolute',
    top: '0px',
    right: '0px',
  },
}));

export default function MultiLegend(props) {
  const {
    theme,
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
        const layerCoordination = pointLayerCoordination[0][layerScope];

        const {
          spatialLayerVisible,
          obsColorEncoding,
          obsType,
          featureType,
          featureValueType,
          spatialLayerColor,
          legendVisible,
        } = layerCoordination;

        const isStaticColor = obsColorEncoding === 'spatialLayerColor';
        const height = isStaticColor ? 20 : 36;

        return spatialLayerVisible && legendVisible ? (
          <Legend
            key={layerScope}
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
            featureSelection={null}
            // featureLabelsMap={featureLabelsMap} // TODO
            featureValueColormap="viridis"
            featureValueColormapRange={[0, 1]}
            extent={null}
            height={height}
          />
        ) : null;
      }) : null}
      {/* Spots */}
      {spotLayerScopes ? reversedSpotLayerScopes.flatMap((layerScope) => {
        const layerCoordination = spotLayerCoordination[0][layerScope];

        const {
          spatialLayerVisible,
          obsColorEncoding,
          featureValueColormap,
          featureValueColormapRange,
          obsType,
          featureType,
          featureValueType,
          featureSelection,
          spatialLayerColor,
          legendVisible,
          obsSetSelection,
          obsSetColor,
        } = layerCoordination;

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
            featureLabelsMap={featureLabelsMap}
            featureValueColormap={featureValueColormap}
            featureValueColormapRange={featureValueColormapRange}
            extent={firstExpressionExtent}
            height={height}
            obsSetSelection={obsSetSelection}
            obsSetColor={obsSetColor}
          />
        ) : null;
      }) : null}
      {/* Segmentations */}
      {segmentationLayerScopes ? reversedSegmentationLayerScopes.flatMap((layerScope) => {
        const layerCoordination = segmentationLayerCoordination[0][layerScope];
        const channelScopes = segmentationChannelScopesByLayer[layerScope];
        const channelCoordination = segmentationChannelCoordination[0][layerScope];

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
            legendVisible,
            obsSetSelection,
            obsSetColor,
          } = channelCoordination[cScope];
          const expressionExtents = segmentationMultiExpressionExtents?.[layerScope]?.[cScope];
          // There can potentially be multiple features/genes selected, but we
          // are only using the first one for now here.
          const firstExpressionExtent = expressionExtents?.[0];
          const isStaticColor = obsColorEncoding === 'spatialChannelColor';
          const height = isStaticColor ? 20 : 36;

          return spatialLayerVisible && spatialChannelVisible && legendVisible ? (
            <Legend
              key={`${layerScope}-${cScope}`}
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
              // featureLabelsMap={featureLabelsMap} // TODO
              featureValueColormap={featureValueColormap}
              featureValueColormapRange={featureValueColormapRange}
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
