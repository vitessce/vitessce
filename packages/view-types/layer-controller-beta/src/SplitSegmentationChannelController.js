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
import { PopperMenu } from '@vitessce/vit-s';
import { VectorIconSVG } from '@vitessce/icons';
import {
  useControllerSectionStyles,
  useEllipsisMenuStyles,
} from './styles.js';
import ChannelColorPickerMenu from './ChannelColorPickerMenu.js';


const useStyles = makeStyles(() => ({
  menuItemSlider: {
    width: '100px',
  },
  layerTypeSegmentationIcon: {
    height: '100%',
    marginLeft: '1px',
    fill: 'currentColor',
    fontSize: '24px',
    width: '50%',
    maxWidth: '24px',
  },
}));

function SegmentationChannelEllipsisMenu(props) {
  const {
    strokeWidth,
    setStrokeWidth,
    filled,
    setFilled,
    featureSelection,
    obsColorEncoding,
    setObsColorEncoding,
    featureValueColormapRange,
    setFeatureValueColormapRange,
  } = props;
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const menuClasses = useEllipsisMenuStyles();

  const filledId = useId();
  const strokeWidthId = useId();
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
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={filledId}>
          Filled:&nbsp;
        </label>
        <Checkbox
          color="primary"
          checked={filled}
          onChange={(e, v) => setFilled(v)}
          inputProps={{ id: filledId }}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={strokeWidthId}>
          Stroke width:
        </label>
        <Slider
          disabled={filled}
          value={strokeWidth}
          min={0.5}
          max={5.0}
          step={0.1}
          onChange={(e, v) => setStrokeWidth(v)}
          classes={{ root: classes.menuItemSlider }}
          orientation="horizontal"
          inputProps={{ id: strokeWidthId }}
        />
      </MenuItem>
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
          inputProps={{ id: colormapRangeId }}
        />
      </MenuItem>
    </PopperMenu>
  );
}

export default function SplitVectorLayerController(props) {
  const {
    label,
    opacity,
    setOpacity,
    visible,
    setVisible,
    color,
    setColor,
    palette = null,
    filled,
    setFilled,
    strokeWidth,
    setStrokeWidth,

    featureSelection,
    obsColorEncoding,
    // featureValueColormap, // TODO
    featureValueColormapRange,
    setObsColorEncoding,
    // setFeatureValueColormap, // TODO
    setFeatureValueColormapRange,
  } = props;

  const visibleSetting = typeof visible === 'boolean' ? visible : true;
  const Visibility = visibleSetting ? VisibilityIcon : VisibilityOffIcon;

  const isStaticColor = obsColorEncoding === 'spatialChannelColor';

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
            <ChannelColorPickerMenu
              color={color}
              setColor={setColor}
              palette={palette}
              isStaticColor={isStaticColor}
              visible={visible}
            />
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
            <SegmentationChannelEllipsisMenu
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
              filled={filled}
              setFilled={setFilled}
              featureSelection={featureSelection}
              obsColorEncoding={obsColorEncoding}
              setObsColorEncoding={setObsColorEncoding}
              featureValueColormapRange={featureValueColormapRange}
              setFeatureValueColormapRange={setFeatureValueColormapRange}
            />
          </Grid>
          <Grid item xs={1}>
            <VectorIconSVG className={classes.layerTypeSegmentationIcon} />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}
