/* eslint-disable no-unused-vars */
import React from 'react';
import {
  makeStyles,
  Grid,
  Checkbox,
  Paper,
  Typography,
  Slider,
  MenuItem,
  Button,
  SvgIcon,
} from '@material-ui/core';
import {
  useRemoveImageChannelInMetaCoordinationScopes,
} from '@vitessce/vit-s';
import { VIEWER_PALETTE } from '@vitessce/utils';
import ChannelOptions from './ChannelOptions.js';
import ChannelSlider from './ChannelSlider.js';
import {
  ChannelVisibilityCheckbox,
  ChannelColorPickerMenu,
  ChannelSelectionDropdown,
} from './shared-channel-controls.js';


export default function SplitImageChannelController(props) {
  const {
    coordinationScopesRaw,
    layerScope,
    channelScope,
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
  } = props;

  const removeChannel = useRemoveImageChannelInMetaCoordinationScopes();

  const isLoading = false; // TODO
  const theme = 'dark'; // TODO

  function onRemove() {
    removeChannel(
      coordinationScopesRaw,
      layerScope,
      channelScope,
    );
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
          colormapOn={colormapOn}
          palette={VIEWER_PALETTE}
        />
      </Grid>
      <Grid item xs={6}>
        <ChannelSelectionDropdown
          featureIndex={featureIndex}
          targetC={targetC}
          setTargetC={setTargetC}
          disabled={isLoading}
        />
      </Grid>
      
      <Grid item xs={3}>
        <ChannelSlider
          image={image}
          targetC={targetC}
          window={window}
          setWindow={setWindow}
          disabled={isLoading}
          theme={theme}
          colormapOn={colormapOn}
        />
      </Grid>
      <Grid item xs={1} style={{ marginTop: '4px' }} justifyContent="flex-end">
        <ChannelOptions
          color={color}
          setColor={setColor}
          onRemove={onRemove}
          domainType="min/max" // TODO
          setDomainType={() => {}} // TODO
          disabled={isLoading}
        />
      </Grid>
    </Grid>
  );
}
