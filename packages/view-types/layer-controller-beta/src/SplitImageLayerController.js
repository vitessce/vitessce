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

import { useControllerSectionStyles, useSelectStyles } from './styles.js';
import SplitImageChannelController from './SplitImageChannelController.js';

const useStyles = makeStyles(() => ({
  layerRowLabel: {
    textAlign: 'right !important',
  },
  inputLabel: {
    margin: '4px 0',
    fontSize: '14px',
    lineHeight: '21px',
  },
}));

export default function SplitImageLayerController(props) {
  const {
    layerScope,
    layerCoordination,
    setLayerCoordination,
    channelScopes,
    channelCoordination,
    setChannelCoordination,
    image,
    use3d, /* TODO */
  } = props;

  const [open, setOpen] = useState(true);

  const {
    spatialLayerVisible: visible,
    spatialLayerOpacity: opacity,
    spatialLayerColormap: colormap,
  } = layerCoordination;
  const {
    setSpatialLayerVisible: setVisible,
    setSpatialLayerOpacity: setOpacity,
    setSpatialLayerColormap: setColormap,
  } = setLayerCoordination;

  const visibleSetting = typeof visible === 'boolean' ? visible : true;
  const Visibility = visibleSetting ? VisibilityIcon : VisibilityOffIcon;

  // TODO: does this work for non-OME-TIFF?
  const label = image?.image?.loaders?.[0]?.metadata?.Name;

  const colormapInputId = `${layerScope}-colormap`;

  function handleColormapChange(newColormapName) {
    setColormap(newColormapName);
  }

  const classes = useStyles();
  const controllerSectionClasses = useControllerSectionStyles();
  const selectClasses = useSelectStyles();
  return (
    <Grid item style={{ marginTop: '10px' }}>
      <Paper className={controllerSectionClasses.layerControllerRoot}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid item xs={1}>
            <Button
              onClick={(e) => {
                // Needed to prevent affecting the expansion panel from changing
                e.stopPropagation();
                const nextVisible = typeof visible === 'boolean' ? !visible : false;
                setVisible(nextVisible);
              }}
              style={{
                marginRight: 8,
                marginBottom: 2,
                marginLeft: 8,
                marginTop: 8,
                padding: 0,
                minWidth: 0,
              }}
            >
              <Visibility />
            </Button>
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={6}>
            <Typography
              style={{
                padding: 0,
                marginBottom: 0,
                marginLeft: '4px',
                marginTop: '10px',
              }}
            >
              {label}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Slider
              value={opacity}
              min={0}
              max={1}
              step={0.001}
              onChange={(e, v) => setOpacity(v)}
              style={{ marginTop: '7px' }}
              orientation="horizontal"
            />
          </Grid>
          <Grid item xs={2} container direction="row" justifyContent="flex-end">
            <ImageIcon style={{ marginTop: '8px' }} />
            <Button
              onClick={(e) => {
                // Needed to prevent affecting the expansion panel from changing
                e.stopPropagation();
                setOpen(prev => !prev);
              }}
              style={{
                display: 'inline-block',
                margin: 0,
                padding: 0,
                minWidth: 0,
                lineHeight: 1,
              }}
            >
              {open ? <ExpandLess /> : <ExpandMore />}
            </Button>
          </Grid>
        </Grid>
        {open ? (
          <Grid container direction="column" justifyContent="space-between">
            <Grid item container direction="row">
              <Grid item xs={2} className={classes.layerRowLabel}>
                <InputLabel htmlFor={colormapInputId} className={classes.inputLabel}>Colormap:</InputLabel>
              </Grid>
              <Grid item xs={10}>
                <Select
                  native
                  onChange={e => handleColormapChange(e.target.value === '' ? null : e.target.value)}
                  value={colormap === null ? '' : colormap}
                  inputProps={{ name: 'colormap', id: colormapInputId }}
                  style={{ width: '100%', fontSize: '14px' }}
                  classes={{ root: selectClasses.selectRoot }}
                >
                  <option aria-label="None" value="">None</option>
                  {COLORMAP_OPTIONS.map(name => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              </Grid>
            </Grid>
            {channelScopes.map((cScope) => {
              const {
                spatialTargetC,
                spatialChannelVisible,
                spatialChannelOpacity,
                spatialChannelColor,
                spatialChannelWindow,
              } = channelCoordination[cScope];
              const {
                setSpatialTargetC,
                setSpatialChannelVisible,
                setSpatialChannelOpacity,
                setSpatialChannelColor,
                setSpatialChannelWindow,
              } = setChannelCoordination[cScope];

              return (
                <SplitImageChannelController
                  key={cScope}
                  targetC={spatialTargetC}
                  setTargetC={setSpatialTargetC}
                  visible={spatialChannelVisible}
                  setVisible={setSpatialChannelVisible}
                  opacity={spatialChannelOpacity}
                  setOpacity={setSpatialChannelOpacity}
                  color={spatialChannelColor}
                  setColor={setSpatialChannelColor}
                  window={spatialChannelWindow}
                  setWindow={setSpatialChannelWindow}
                  colormapOn={colormap !== null}
                  featureIndex={image?.featureIndex}
                  image={image?.image}
                />
              );
            })}
          </Grid>
        ) : null}
      </Paper>
    </Grid>
  );
}
