/* eslint-disable jsx-a11y/label-has-associated-control */
// eslint gets confused by the "id" being within MUI's inputProps.
import React, { useState, useId } from 'react';
import {
  makeStyles,
  Grid,
  Checkbox,
  Paper,
  Typography,
  Slider,
  MenuItem,
  Button,
} from '@material-ui/core';
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@material-ui/icons';
import plur from 'plur';
import { PopperMenu } from '@vitessce/vit-s';
import { SpotsIconSVG } from '@vitessce/icons';
import {
  useControllerSectionStyles,
  useEllipsisMenuStyles,
} from './styles.js';
import { capitalize } from '@vitessce/utils';

const useStyles = makeStyles(() => ({
  menuItemSlider: {
    width: '100px',
  },
  layerTypeSpotIcon: {
    height: '100%',
    marginLeft: '1px',
    fill: 'currentColor',
    fontSize: '20px',
    width: '50%',
    maxWidth: '20px',
  },
}));

function SpotLayerEllipsisMenu(props) {
  const {
    featureSelection,
    obsColorEncoding,
    setObsColorEncoding,
    featureValueColormapRange,
    setFeatureValueColormapRange,
  } = props;
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const menuClasses = useEllipsisMenuStyles();

  const quantitativeColormapId = useId();
  const colormapRangeId = useId();

  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<MoreVertIcon />}
      buttonClassName={menuClasses.imageLayerMenuButton}
      containerClassName={menuClasses.imageLayerPopperContainer}
      withPaper
    >
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={quantitativeColormapId}>
          Quantitative Colormap:&nbsp;
        </label>
        <Checkbox
          // Do not disable if there are selected quantitative features.
          // Also, do not disable if the checkbox is currently checked, to allow un-checking.
          disabled={!((Array.isArray(featureSelection) && featureSelection.length > 0) || obsColorEncoding === 'geneSelection')}
          color="primary"
          checked={obsColorEncoding === 'geneSelection'}
          onChange={(e, v) => setObsColorEncoding(v ? 'geneSelection' : 'spatialChannelColor')}
          inputProps={{ id: quantitativeColormapId }}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={colormapRangeId}>
          Colormap Range:&nbsp;
        </label>
        <Slider
          disabled={obsColorEncoding !== 'geneSelection'}
          value={featureValueColormapRange}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(e, v) => setFeatureValueColormapRange(v)}
          className={classes.menuItemSlider}
          orientation="horizontal"
          id={colormapRangeId}
        />
      </MenuItem>
    </PopperMenu>
  );
}

export default function SplitSpotLayerController(props) {
  const {
    layerScope,
    layerCoordination,
    setLayerCoordination,
  } = props;

  const {
    obsType,
    spatialLayerVisible: visible,
    spatialLayerOpacity: opacity,
    spatialSpotRadius: radius,
    obsColorEncoding,
    featureSelection,
    featureValueColormap,
    featureValueColormapRange,
  } = layerCoordination;
  const {
    setSpatialLayerVisible: setVisible,
    setSpatialLayerOpacity: setOpacity,
    setSpatialSpotRadius: setRadius,
    setObsColorEncoding,
    setFeatureSelection,
    setFeatureValueColormap,
    setFeatureValueColormapRange,
  } = setLayerCoordination;

  const label = capitalize(plur(obsType, 2));

  const visibleSetting = typeof visible === 'boolean' ? visible : true;
  const Visibility = visibleSetting ? VisibilityIcon : VisibilityOffIcon;

  const classes = useStyles();
  const lcClasses = useControllerSectionStyles();
  const menuClasses = useEllipsisMenuStyles();

  function handleVisibleChange() {
    const nextVisible = typeof visible === 'boolean' ? !visible : false;
    setVisible(nextVisible);
  }

  return (
    <Grid item className={lcClasses.layerControllerGrid}>
      <Paper className={lcClasses.layerControllerRoot}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid item xs={1}>
            <Button
              onClick={handleVisibleChange}
              className={menuClasses.imageLayerVisibleButton}
            >
              <Visibility />
            </Button>
          </Grid>
          <Grid item xs={1}>
          </Grid>
          <Grid item xs={6}>
            <Typography className={menuClasses.imageLayerName}>
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
              className={menuClasses.imageLayerOpacitySlider}
              orientation="horizontal"
            />
          </Grid>
          <Grid item xs={1}>
            <SpotLayerEllipsisMenu
              featureSelection={featureSelection}
              obsColorEncoding={obsColorEncoding}
              setObsColorEncoding={setObsColorEncoding}
              featureValueColormapRange={featureValueColormapRange}
              setFeatureValueColormapRange={setFeatureValueColormapRange}
            />
          </Grid>
          <Grid item xs={1}>
            <SpotsIconSVG className={classes.layerTypeSpotIcon} />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}
