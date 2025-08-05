import React, { useMemo } from 'react';
import clsx from 'clsx';
import { makeStyles, Typography } from '@vitessce/styles';
import { colorArrayToString } from '@vitessce/sets-utils';

const useStyles = makeStyles()(() => ({
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
  channelNameText: {
    marginRight: '10px',
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

  const { classes } = useStyles();

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
          spatialLayerColormap,
        } = layerCoordination;

        const isHorizontal = spatialChannelLabelsOrientation === 'horizontal';


        return ((
          photometricInterpretation !== 'RGB'
          && spatialLayerColormap === null
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
              const imageWrapperInstance = images?.[layerScope]?.image?.instance;
              const channelNames = imageWrapperInstance?.getChannelNames();
              const channelIndex = imageWrapperInstance?.getChannelIndex(spatialTargetC);
              const channelName = channelNames?.[channelIndex];

              return spatialLayerVisible && spatialChannelVisible && spatialChannelLabelsVisible ? (
                <Typography
                  variant="h6"
                  key={`${layerScope}-${cScope}-${channelIndex}-${rgbColor}`}
                  className={classes.channelNameText}
                  style={{
                    color: rgbColor,
                    fontSize: `${spatialChannelLabelSize}px`,
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
