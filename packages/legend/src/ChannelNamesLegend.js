import React, { useMemo } from 'react';
import clsx from 'clsx';
import { makeStyles, Typography } from '@material-ui/core';
import { colorArrayToString } from '@vitessce/sets-utils';

const useStyles = makeStyles(() => ({
  channelNamesLegendContainer: {
    position: 'absolute',
    bottom: '0px',
    left: '0px',
    paddingLeft: '10px',
    paddingBottom: '10px',
  },
  channelNamesLegendLayer: {
    display: 'flex',
  },
  channelNamesRow: {
    flexDirection: 'column',
  },
  channelNamesCol: {
    flexDirection: 'row',
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
    <div className={classes.channelNamesLegendContainer}>
      {/* Images */}
      {imageLayerScopes ? reversedImageLayerScopes.map((layerScope) => {
        const layerCoordination = imageLayerCoordination[0][layerScope];
        const channelScopes = imageChannelScopesByLayer[layerScope];
        const channelCoordination = imageChannelCoordination[0][layerScope];

        const {
          spatialLayerVisible,
          photometricInterpretation,
          spatialChannelLabelsVisible,
          spatialChannelLabelsOrientation,
          spatialChannelLabelSize,
        } = layerCoordination;

        const isHorizontal = spatialChannelLabelsOrientation === 'horizontal';


        return ((
          photometricInterpretation !== 'RGB'
          && channelCoordination
          && channelScopes
        ) ? (
          <div
            className={clsx(
              classes.channelNamesLegendLayer,
              {
                [classes.channelNamesCol]: isHorizontal,
                [classes.channelNamesRow]: !isHorizontal,
              },
            )}
            key={layerScope}
          >
            {channelScopes.map((cScope) => {
              const {
                spatialTargetC,
                spatialChannelVisible,
                spatialChannelColor,
              } = channelCoordination[cScope];

              const rgbColor = colorArrayToString(spatialChannelColor);
              const channelNames = images?.[layerScope]?.image?.instance.getChannelNames();
              const channelName = channelNames?.[spatialTargetC];

              return spatialLayerVisible && spatialChannelVisible && spatialChannelLabelsVisible ? (
                <Typography
                  variant="h6"
                  key={`${layerScope}-${cScope}-${spatialTargetC}-${rgbColor}`}
                  style={{
                    color: rgbColor,
                    fontSize: `${spatialChannelLabelSize}px`,
                    marginRight: '10px',
                  }}
                >
                  {channelName}
                </Typography>
              ) : null;
            })}
          </div>
        ) : null);
      }) : null}
    </div>
  );
}
