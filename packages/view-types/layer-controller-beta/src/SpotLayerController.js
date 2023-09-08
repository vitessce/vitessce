/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
// eslint gets confused by the "id" being within MUI's inputProps.
import React, { useState, useMemo, useCallback, useId } from 'react';
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
import { SpotsIconSVG } from '@vitessce/icons';
import { capitalize } from '@vitessce/utils';
import {
  useControllerSectionStyles,
  useEllipsisMenuStyles,
  useSelectStyles,
} from './styles.js';
import ChannelColorPickerMenu from './ChannelColorPickerMenu.js';

const useStyles = makeStyles(() => ({
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
    strokeWidth,
    setStrokeWidth,
    filled,
    setFilled,
    featureSelection,
    obsColorEncoding,
    setObsColorEncoding,
    featureValueColormapRange,
    setFeatureValueColormapRange,
    tooltipsVisible,
    setTooltipsVisible,
    tooltipCrosshairsVisible,
    setTooltipCrosshairsVisible,
    legendVisible,
    setLegendVisible,
  } = props;
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const selectClasses = useSelectStyles();
  const menuClasses = useEllipsisMenuStyles();

  const filledId = useId();
  const strokeWidthId = useId();
  const quantitativeColormapId = useId();
  const colormapRangeId = useId();
  const tooltipsVisibleId = useId();
  const crosshairsVisibleId = useId();
  const legendVisibleId = useId();

  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<MoreVertIcon />}
      buttonClassName={menuClasses.imageLayerMenuButton}
      containerClassName={menuClasses.imageLayerPopperContainer}
      withPaper
      aria-label="Open spot layer options menu"
    >
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={filledId}>
          Filled:&nbsp;
        </label>
        <Checkbox
          color="primary"
          checked={filled}
          onChange={(e, v) => setFilled(v)}
          inputProps={{ id: filledId, 'aria-label': 'Toggle between filled and stroked spots' }}
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
          className={menuClasses.menuItemSlider}
          orientation="horizontal"
          id={strokeWidthId}
          aria-label="Stroke width slider"
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={quantitativeColormapId}>
          Color Encoding:&nbsp;
        </label>
        <Select
          native
          onChange={e => setObsColorEncoding(e.target.value)}
          value={obsColorEncoding}
          inputProps={{ id: quantitativeColormapId, 'aria-label': 'Color encoding selector' }}
          classes={{ root: selectClasses.selectRoot }}
        >
          <option value="spatialLayerColor">Static Color</option>
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
          className={menuClasses.menuItemSlider}
          orientation="horizontal"
          id={colormapRangeId}
          getAriaLabel={index => (index === 0 ? 'Low value colormap range slider' : 'High value colormap range slider')}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={tooltipsVisibleId}>
          Tooltips Visible:&nbsp;
        </label>
        <Checkbox
          color="primary"
          checked={tooltipsVisible}
          onChange={(e, v) => setTooltipsVisible(v)}
          inputProps={{ id: tooltipsVisibleId, 'aria-label': 'Toggle tooltip visibility' }}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={crosshairsVisibleId}>
          Tooltip Crosshairs Visible:&nbsp;
        </label>
        <Checkbox
          color="primary"
          checked={tooltipCrosshairsVisible}
          onChange={(e, v) => setTooltipCrosshairsVisible(v)}
          inputProps={{ id: crosshairsVisibleId, 'aria-label': 'Toggle tooltip crosshair visibility' }}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={legendVisibleId}>
          Legend Visible:&nbsp;
        </label>
        <Checkbox
          color="primary"
          checked={legendVisible}
          onChange={(e, v) => setLegendVisible(v)}
          inputProps={{ id: legendVisibleId, 'aria-label': 'Toggle legend visibility' }}
        />
      </MenuItem>
    </PopperMenu>
  );
}

export default function SpotLayerController(props) {
  const {
    theme,
    layerScope,
    layerCoordination,
    setLayerCoordination,
    palette = null,
  } = props;

  const {
    obsType,
    spatialLayerVisible: visible,
    spatialLayerOpacity: opacity,
    spatialSpotRadius: radius,
    spatialSpotFilled: filled,
    spatialSpotStrokeWidth: strokeWidth,
    spatialLayerColor: color,

    obsColorEncoding,
    featureSelection,
    featureValueColormap,
    featureValueColormapRange,
    tooltipsVisible,
    tooltipCrosshairsVisible,
    legendVisible,
  } = layerCoordination;
  const {
    setSpatialLayerVisible: setVisible,
    setSpatialLayerOpacity: setOpacity,
    setSpatialSpotRadius: setRadius,
    setSpatialSpotFilled: setFilled,
    setSpatialSpotStrokeWidth: setStrokeWidth,
    setSpatialLayerColor: setColor,
    setObsColorEncoding,
    setFeatureSelection,
    setFeatureValueColormap,
    setFeatureValueColormapRange,
    setTooltipsVisible,
    setTooltipCrosshairsVisible,
    setLegendVisible,
  } = setLayerCoordination;

  const label = capitalize(obsType);

  const visibleSetting = typeof visible === 'boolean' ? visible : true;
  const Visibility = useMemo(() => (
    visibleSetting
      ? VisibilityIcon
      : VisibilityOffIcon
  ), [visibleSetting]);

  const isStaticColor = obsColorEncoding === 'spatialLayerColor';

  const classes = useStyles();
  const lcClasses = useControllerSectionStyles();
  const menuClasses = useEllipsisMenuStyles();

  const handleVisibleChange = useCallback(() => {
    const nextVisible = typeof visible === 'boolean' ? !visible : false;
    setVisible(nextVisible);
  }, [visible, setVisible]);

  const handleOpacityChange = useCallback((e, v) => setOpacity(v), [setOpacity]);

  return (
    <Grid item className={lcClasses.layerControllerGrid}>
      <Paper className={lcClasses.layerControllerRoot}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid item xs={1}>
            <Button
              onClick={handleVisibleChange}
              className={menuClasses.imageLayerVisibleButton}
              aria-label="Toggle spot layer visibility"
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
              {label}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Slider
              value={opacity}
              min={0}
              max={1}
              step={0.001}
              onChange={handleOpacityChange}
              className={menuClasses.imageLayerOpacitySlider}
              orientation="horizontal"
              aria-label={`Adjust opacity for layer ${label}`}
            />
          </Grid>
          <Grid item xs={1}>
            <SpotLayerEllipsisMenu
              filled={filled}
              setFilled={setFilled}
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
              featureSelection={featureSelection}
              obsColorEncoding={obsColorEncoding}
              setObsColorEncoding={setObsColorEncoding}
              featureValueColormapRange={featureValueColormapRange}
              setFeatureValueColormapRange={setFeatureValueColormapRange}
              tooltipsVisible={tooltipsVisible}
              setTooltipsVisible={setTooltipsVisible}
              tooltipCrosshairsVisible={tooltipCrosshairsVisible}
              setTooltipCrosshairsVisible={setTooltipCrosshairsVisible}
              legendVisible={legendVisible}
              setLegendVisible={setLegendVisible}
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
