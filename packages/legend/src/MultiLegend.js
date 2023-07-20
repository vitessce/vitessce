import React from 'react';
import { makeStyles } from '@material-ui/core';
import Legend from './Legend.js';


const useStyles = makeStyles(() => ({
  multiLegend: {
    position: 'absolute',
    top: '0px',
    right: '0px',
  },
}));

export default function MultiLegend(props) {
  const {
    theme,
    segmentationLayerScopes,
    segmentationLayerCoordination,
    segmentationChannelScopesByLayer,
    segmentationChannelCoordination,
    multiExpressionExtents,
  } = props;

  const classes = useStyles();

  return (
    <div className={classes.multiLegend}>
      {segmentationLayerScopes ? segmentationLayerScopes.flatMap((layerScope) => {
        const layerCoordination = segmentationLayerCoordination[0][layerScope];
        const channelScopes = segmentationChannelScopesByLayer[layerScope];
        const channelCoordination = segmentationChannelCoordination[0][layerScope];

        const {
          spatialLayerVisible,
        } = layerCoordination;

        return (channelCoordination && channelScopes ? channelScopes.map((cScope) => {
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
          } = channelCoordination[cScope];
          const expressionExtents = multiExpressionExtents?.[layerScope]?.[cScope];
          // There can potentially be multiple features/genes selected, but we
          // are only using the first one for now here.
          const firstExpressionExtent = expressionExtents?.[0];
          const isStaticColor = obsColorEncoding === 'spatialChannelColor';
          const height = isStaticColor ? 20 : 36;

          return spatialLayerVisible && spatialChannelVisible ? (
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
            />
          ) : null;
        }) : null);
      }) : null}
    </div>
  );
}
