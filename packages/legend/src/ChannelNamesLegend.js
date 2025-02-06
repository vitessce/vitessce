import React, { useMemo } from 'react';
import { css } from '@emotion/react';
import clsx from 'clsx';
import { Typography } from '@mui/material';
import { colorArrayToString } from '@vitessce/sets-utils';

const channelNamesLegendContainer = css({
  position: 'absolute',
  bottom: '0px',
  left: '0px',
  paddingLeft: '10px',
  paddingBottom: '10px',
});

const channelNamesLegendLayer = css({

  display: 'flex',
});

const channelNamesRow = css({
  flexDirection: 'column',
});

const channelNamesCol = css({
  flexDirection: 'row',

});

const channelNameText = css({
  marginRight: '10px',
});


export default function ChannelNamesLegend(props) {
  const {
    images,
    imageLayerScopes,
    imageLayerCoordination,
    imageChannelScopesByLayer,
    imageChannelCoordination,
  } = props;


  const reversedImageLayerScopes = useMemo(() => (
    [...(imageLayerScopes || [])].reverse()
  ), [imageLayerScopes]);

  return (
    (
      <div className={channelNamesLegendContainer}>
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
                channelNamesLegendLayer,
                {
                  [channelNamesCol]: isHorizontal,
                  [channelNamesRow]: !isHorizontal,
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

                return (spatialLayerVisible
                && spatialChannelVisible
                && spatialChannelLabelsVisible) ? (
                  <Typography
                    variant="h6"
                    key={`${layerScope}-${cScope}-${channelIndex}-${rgbColor}`}
                    className={channelNameText}
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
    )
  );
}
