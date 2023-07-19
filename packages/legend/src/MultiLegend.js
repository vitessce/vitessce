import React from 'react';
import { makeStyles } from '@material-ui/core';
import {
  useUint8FeatureSelection,
} from '@vitessce/vit-s';
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
    multiExpressionData,
  } = props;

  const classes = useStyles();

  return (
    <div className={classes.multiLegend}>
      {segmentationLayerScopes.flatMap((layerScope) => {
        const layerCoordination = segmentationLayerCoordination[0][layerScope];
        const channelScopes = segmentationChannelScopesByLayer[layerScope];
        const channelCoordination = segmentationChannelCoordination[0][layerScope];

        const {
          spatialLayerVisible,
        } = layerCoordination;

        return channelScopes.map((cScope) => {
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
          const channelExpressionData = multiExpressionData?.[layerScope]?.[cScope];
          // eslint-disable-next-line no-unused-vars
          const [uint8ExpressionData, expressionExtents] = useUint8FeatureSelection(
            channelExpressionData,
          );

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
              extent={expressionExtents?.[0]}
              height={height}

              spatialChannelColor={spatialChannelColor}
            />
          ) : null;
        });
      })}
    </div>
  );
}
