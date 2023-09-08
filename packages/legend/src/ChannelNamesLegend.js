import React, { useMemo } from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { colorArrayToString } from '@vitessce/sets-utils';

const useStyles = makeStyles(() => ({
  channelNamesLegend: {
    position: 'absolute',
    bottom: '0px',
    left: '0px',
    paddingLeft: '10px',
    paddingBottom: '10px',
  },
}));

export default function ChannelNamesLegend(props) {
  const {
    images,
    imageLayerScopes,
    imageLayerCoordination,

    imageChannelScopesByLayer,
    imageChannelCoordination,
  } = props;

  const classes = useStyles();

  const reversedImageLayerScopes = useMemo(() => (
    [...(imageLayerScopes || [])].reverse()
  ), [imageLayerScopes]);

  return (
    <div className={classes.channelNamesLegend}>
      {/* Images */}
      {imageLayerScopes ? reversedImageLayerScopes.flatMap((layerScope) => {
        const layerCoordination = imageLayerCoordination[0][layerScope];
        const channelScopes = imageChannelScopesByLayer[layerScope];
        const channelCoordination = imageChannelCoordination[0][layerScope];

        const {
          spatialLayerVisible,
          photometricInterpretation,
          // TODO: new coordination types for channel name:
          // - visibility
          // - text size
          // - orientation
        } = layerCoordination;


        return ((
          photometricInterpretation !== 'RGB'
          && channelCoordination
          && channelScopes
        ) ? channelScopes.map((cScope) => {
            const {
              spatialTargetC,
              spatialChannelVisible,
              spatialChannelColor,
            } = channelCoordination[cScope];

            const rgbColor = colorArrayToString(spatialChannelColor);
            const channelNames = images?.[layerScope]?.image?.instance.getChannelNames();
            const channelName = channelNames?.[spatialTargetC];

            return spatialLayerVisible && spatialChannelVisible ? (
              <Typography
                variant="h6"
                key={`${layerScope}-${cScope}-${spatialTargetC}-${rgbColor}`}
                style={{
                  color: rgbColor,
                  fontSize: '14px',
                }}
              >
                {channelName}
              </Typography>
            ) : null;
          }) : null);
      }) : null}
    </div>
  );
}
