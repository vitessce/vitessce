import React, { useState } from 'react';

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
  Select,
  InputLabel,
} from '@material-ui/core';
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ColorLens,
  Image as ImageIcon,
  ExpandMore,
  ExpandLess,
} from '@material-ui/icons';

import { PopperMenu } from '@vitessce/vit-s';
import { TwitterPicker } from 'react-color-with-lodash';
import { colorArrayToString } from '@vitessce/sets-utils';
import { PATHOLOGY_PALETTE, LARGE_PATHOLOGY_PALETTE, COLORMAP_OPTIONS } from '@vitessce/utils';
import { CoordinationType } from '@vitessce/constants-internal';
import { getSourceFromLoader } from '@vitessce/spatial-utils';
import ChannelOptions from './ChannelOptions.js';
import { DOMAINS } from './constants.js';

import { useControllerSectionStyles, useSelectStyles } from './styles.js';
import { getMultiSelectionStats, toRgbUIString } from './utils.js';
import {
  ChannelSelectionDropdown,
  ChannelVisibilityCheckbox,
} from './shared-channel-controls.js';


const useStyles = makeStyles(() => ({
  
}));

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
  } = props;

  const classes = useStyles();
  const isLoading = false; // TODO
  const theme = 'light'; //  TODO

  const rgbColor = toRgbUIString(colormapOn, color, theme);

  function toggleVisible() {
    setVisible(!visible);
  }

  function onRemove() {

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
            domainType={'min/max'}
            setDomainType={() => {}}
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
          {/*<ChannelSlider
            color={rgbColor}
            slider={slider}
            domain={domain || DOMAINS[dtype]}
            dtype={dtype}
            handleChange={v => handlePropertyChange('slider', v)}
            disabled={isLoading}
          />*/}
        </Grid>
      </Grid>
    </Grid>
  );
}
