import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { PopperMenu } from '@vitessce/vit-s';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import Button from '@material-ui/core/Button';
import ColorLens from '@material-ui/icons/ColorLens';
import ImageIcon from '@material-ui/icons/Image';
import SvgIcon from '@material-ui/core/SvgIcon';

import { TwitterPicker } from 'react-color-with-lodash';
import { colorArrayToString } from '@vitessce/sets-utils';
import { PATHOLOGY_PALETTE, LARGE_PATHOLOGY_PALETTE } from '@vitessce/utils';

import { useControllerSectionStyles } from './styles';

const useStyles = makeStyles(() => ({
  
}));

export default function SplitImageLayerController(props) {
  const {
    layerScope,
    visible,
  } = props;

  const visibleSetting = typeof visible === 'boolean' ? visible : true;
  const Visibility = visibleSetting ? VisibilityIcon : VisibilityOffIcon;


  const classes = useControllerSectionStyles();
  return (
    <Grid item style={{ marginTop: '10px' }}>
      <p>{layerScope}</p>
    </Grid>
  );
}
