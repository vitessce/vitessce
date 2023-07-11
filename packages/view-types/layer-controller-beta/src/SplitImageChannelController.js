/* eslint-disable no-unused-vars */
import React from 'react';
import {
  Grid,
} from '@material-ui/core';
import ChannelOptions from './ChannelOptions.js';
import ChannelSlider from './ChannelSlider.js';
import { toRgbUIString } from './utils.js';
import {
  ChannelSelectionDropdown,
  ChannelVisibilityCheckbox,
} from './shared-channel-controls.js';


export default function SplitImageChannelController(props) {
  const {
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

  const isLoading = false; // TODO
  const theme = 'light'; //  TODO

  const rgbColor = toRgbUIString(colormapOn, color, theme);

  function toggleVisible() {
    setVisible(!visible);
  }

  function onRemove() {
    // TODO
  }

  return (
    <Grid container direction="column" m={1} justifyContent="center">
      <Grid container direction="row" justifyContent="space-between">
        <Grid item xs={10}>
          <ChannelSelectionDropdown
            featureIndex={featureIndex}
            targetC={targetC}
            setTargetC={setTargetC}
            disabled={isLoading}
          />
        </Grid>
        <Grid item xs={1} style={{ marginTop: '4px' }}>
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
      <Grid container direction="row" justifyContent="space-between">
        <Grid item xs={2}>
          <ChannelVisibilityCheckbox
            color={rgbColor}
            checked={visible}
            toggle={toggleVisible}
            disabled={isLoading}
          />
        </Grid>
        <Grid item xs={9}>
          <ChannelSlider
            image={image}
            targetC={targetC}
            color={rgbColor}
            window={window}
            setWindow={setWindow}
            disabled={isLoading}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
