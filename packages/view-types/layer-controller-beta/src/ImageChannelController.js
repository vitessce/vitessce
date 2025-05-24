import React, { useState } from 'react';
import {
  Grid,
} from '@vitessce/styles';
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


export default function ImageChannelController(props) {
  const {
    theme,
    coordinationScopesRaw,
    layerScope,
    channelScope,
    targetT,
    targetZ,
    targetC,
    setTargetC,
    visible,
    setVisible,
    // opacity, // TODO: support per-channel opacity?
    // setOpacity,
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
    queryKey: ['minMaxDomain', image?.getName(), targetT, targetC, is3dMode ? 0 : targetZ, is3dMode],
    queryFn: async (ctx) => {
      const loader = ctx.meta.image?.getData();
      const selection = {
        t: ctx.queryKey[2],
        c: ctx.queryKey[3],
        z: Math.floor(ctx.queryKey[4]),
      };
      const stats = await getMultiSelectionStats({
        loader,
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
      <Grid size={1}>
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
      <Grid size={1}>
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
      <Grid size={6}>
        <ChannelSelectionDropdown
          featureIndex={featureIndex}
          targetC={targetC}
          setTargetC={setTargetC}
          setWindow={setWindow}
          disabled={isLoading}
        />
      </Grid>

      <Grid size={3}>
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
      <Grid size={1}>
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
