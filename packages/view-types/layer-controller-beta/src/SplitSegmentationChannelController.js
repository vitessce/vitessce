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
  Select,
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
  useSelectStyles,
} from './styles.js';
import ChannelColorPickerMenu from './ChannelColorPickerMenu.js';
import { capitalize } from '@vitessce/utils';


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
    obsType,
    featureType,
    featureValueType,
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
  const selectClasses = useSelectStyles();
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
          min={0.01}
          max={5.0}
          step={0.01}
          onChange={(e, v) => setStrokeWidth(v)}
          classes={{ root: classes.menuItemSlider }}
          orientation="horizontal"
          id={strokeWidthId}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={quantitativeColormapId}>
          Color Encoding:&nbsp;
        </label>
        <Select
          native
          //disabled={!((Array.isArray(featureSelection) && featureSelection.length > 0) || obsColorEncoding === 'geneSelection')}
          onChange={(e) => setObsColorEncoding(e.target.value)}
          value={obsColorEncoding}
          inputProps={{ id: quantitativeColormapId }}
          classes={{ root: selectClasses.selectRoot }}
        >
          <option value="spatialChannelColor">Static Color</option>
          <option value="geneSelection">Feature Value</option>
          <option value="cellSetSelection">Set Selection</option>
        </Select>
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

export default function SplitVectorLayerController(props) {
  const {
    label,
    theme,
    obsType,
    featureType,
    featureValueType,
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
              theme={theme}
              color={color}
              setColor={setColor}
              palette={palette}
              isStaticColor={isStaticColor}
              visible={visible}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography className={menuClasses.imageLayerName}>
              {capitalize(label)}
              {/*capitalize(plur(label, 2))*/}
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
              obsType={obsType}
              featureType={featureType}
              featureValueType={featureValueType}
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
