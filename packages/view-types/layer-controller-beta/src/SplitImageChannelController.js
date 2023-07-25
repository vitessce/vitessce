/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  Grid,
} from '@material-ui/core';
import { useQuery } from '@tanstack/react-query';
import {
  getMultiSelectionStats,
} from '@vitessce/spatial-utils';
import {
  useRemoveImageChannelInMetaCoordinationScopes,
} from '@vitessce/vit-s';
import { VIEWER_PALETTE } from '@vitessce/utils';

import ChannelOptions from './ChannelOptions.js';
import ChannelSlider from './ChannelSlider.js';
import ChannelVisibilityCheckbox from './ChannelVisibilityCheckbox.js';
import ChannelColorPickerMenu from './ChannelColorPickerMenu.js';
import ChannelSelectionDropdown from './ChannelSelectionDropdown.js';


export default function SplitImageChannelController(props) {
  const {
    coordinationScopesRaw,
    layerScope,
    channelScope,
    targetT,
    targetZ,
    targetC,
    setTargetC,
    visible,
    setVisible,
    opacity,
    setOpacity,
    color,
    setColor,
    window,
    setWindow,
    colormapOn,
    featureIndex, // The channel names.
    image, // To get the channel window extent using image metadata.
    spatialRenderingMode,
  } = props;

  const removeChannel = useRemoveImageChannelInMetaCoordinationScopes();
  const [showValueExtent, setShowValueExtent] = useState(true);

  const isLoading = false; // TODO
  const theme = 'dark'; // TODO
  const is3dMode = spatialRenderingMode === '3D';

  function onRemove() {
    removeChannel(
      coordinationScopesRaw,
      layerScope,
      channelScope,
    );
  }

  const minMaxQuery = useQuery({
    enabled: Boolean(image?.getData()) && !isLoading,
    structuralSharing: false,
    queryKey: ['minMaxDomain', image?.getName(), targetT, targetZ, targetC, is3dMode],
    queryFn: async (ctx) => {
      const selection = {
        t: ctx.queryKey[2],
        z: ctx.queryKey[3],
        c: ctx.queryKey[4],
      };
      const stats = await getMultiSelectionStats({
        loader: ctx.meta.image?.getData(),
        selections: [selection],
        use3d: ctx.queryKey[5],
      });
      // eslint-disable-next-line prefer-destructuring
      const [newDomain] = stats.domains;
      return newDomain;
    },
    meta: { image },
  });

  const minMaxDomain = minMaxQuery.data;
  const disabled = isLoading || minMaxQuery.isLoading;

  function handleResetWindowUsingIQR() {
    if (!disabled) {
      setWindow(minMaxDomain);
    }
  }

  return (
    <Grid container direction="row" justifyContent="space-between">
      <Grid item xs={1}>
        <ChannelVisibilityCheckbox
          color={color}
          setColor={setColor}
          visible={visible}
          setVisible={setVisible}
          disabled={isLoading}
          theme={theme}
          colormapOn={colormapOn}
        />
      </Grid>
      <Grid item xs={1}>
        <ChannelColorPickerMenu
          color={color}
          setColor={setColor}
          visible={visible}
          setVisible={setVisible}
          disabled={isLoading}
          theme={theme}
          isStaticColor={!colormapOn}
          palette={VIEWER_PALETTE}
        />
      </Grid>
      <Grid item xs={6}>
        <ChannelSelectionDropdown
          featureIndex={featureIndex}
          targetC={targetC}
          setTargetC={setTargetC}
          setWindow={setWindow}
          disabled={isLoading}
        />
      </Grid>

      <Grid item xs={3}>
        <ChannelSlider
          image={image}
          targetT={targetT}
          targetZ={targetZ}
          targetC={targetC}
          window={window}
          setWindow={setWindow}
          disabled={disabled}
          color={color}
          theme={theme}
          colormapOn={colormapOn}
          showValueExtent={showValueExtent}
          minMaxDomain={minMaxDomain}
        />
      </Grid>
      <Grid item xs={1} style={{ marginTop: '4px' }}>
        <ChannelOptions
          onRemove={onRemove}
          showValueExtent={showValueExtent}
          setShowValueExtent={setShowValueExtent}
          onResetWindowUsingIQR={handleResetWindowUsingIQR}
        />
      </Grid>
    </Grid>
  );
}
