/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
// eslint gets confused by the "id" being within MUI's inputProps.
import React, { useState, useMemo, useCallback } from 'react';
import { useId } from 'react-aria';
import {
  makeStyles,
  Grid,
  Paper,
  Typography,
  Slider,
  MenuItem,
  Button,
  NativeSelect,
  Checkbox,

  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@vitessce/styles';
import { PopperMenu } from '@vitessce/vit-s';
import { PointsIconSVG } from '@vitessce/icons';
import { capitalize } from '@vitessce/utils';
import {
  useControllerSectionStyles,
  useEllipsisMenuStyles,
  useSelectStyles,
} from './styles.js';
import ChannelColorPickerMenu from './ChannelColorPickerMenu.js';

const useStyles = makeStyles()(() => ({
  layerTypePointIcon: {
    height: '100%',
    marginLeft: '1px',
    fill: 'currentColor',
    fontSize: '20px',
    width: '50%',
    maxWidth: '20px',
  },
}));

function PointLayerEllipsisMenu(props) {
  const {
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
  const { classes: selectClasses } = useSelectStyles();
  const { classes: menuClasses } = useEllipsisMenuStyles();

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
      aria-label="Open point layer options menu"
    >
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={quantitativeColormapId}>
          Color Encoding:&nbsp;
        </label>
        <NativeSelect
          onChange={e => setObsColorEncoding(e.target.value)}
          value={obsColorEncoding}
          inputProps={{ id: quantitativeColormapId, 'aria-label': 'Color encoding selector' }}
          classes={{ root: selectClasses.selectRoot }}
        >
          <option value="spatialLayerColor">Static Color</option>
          <option value="obsLabels">Label Value</option>
        </NativeSelect>
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
          className={menuClasses.menuItemCheckbox}
          checked={tooltipsVisible}
          onChange={(e, v) => setTooltipsVisible(v)}
          slotProps={{ input: { id: tooltipsVisibleId, 'aria-label': 'Toggle tooltip visibility' } }}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={crosshairsVisibleId}>
          Tooltip Crosshairs Visible:&nbsp;
        </label>
        <Checkbox
          color="primary"
          className={menuClasses.menuItemCheckbox}
          checked={tooltipCrosshairsVisible}
          onChange={(e, v) => setTooltipCrosshairsVisible(v)}
          slotProps={{ input: { id: crosshairsVisibleId, 'aria-label': 'Toggle tooltip crosshair visibility' } }}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={legendVisibleId}>
          Legend Visible:&nbsp;
        </label>
        <Checkbox
          color="primary"
          className={menuClasses.menuItemCheckbox}
          checked={legendVisible}
          onChange={(e, v) => setLegendVisible(v)}
          slotProps={{ input: { id: legendVisibleId, 'aria-label': 'Toggle legend visibility' } }}
        />
      </MenuItem>
    </PopperMenu>
  );
}

export default function PointLayerController(props) {
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
    obsColorEncoding,
    featureSelection,
    featureValueColormap,
    featureValueColormapRange,
    spatialLayerColor: color,
    tooltipsVisible,
    tooltipCrosshairsVisible,
    legendVisible,
  } = layerCoordination;
  const {
    setSpatialLayerVisible: setVisible,
    setSpatialLayerOpacity: setOpacity,
    setObsColorEncoding,
    setFeatureSelection,
    setFeatureValueColormap,
    setFeatureValueColormapRange,
    setSpatialLayerColor: setColor,
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
  const isColormap = obsColorEncoding === 'geneSelection';

  const { classes } = useStyles();
  const { classes: lcClasses } = useControllerSectionStyles();
  const { classes: menuClasses } = useEllipsisMenuStyles();

  const handleVisibleChange = useCallback(() => {
    const nextVisible = typeof visible === 'boolean' ? !visible : false;
    setVisible(nextVisible);
  }, [visible, setVisible]);

  const handleOpacityChange = useCallback((e, v) => setOpacity(v), [setOpacity]);


  return (
    <Grid className={lcClasses.layerControllerGrid}>
      <Paper elevation={4} className={lcClasses.layerControllerRoot}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid size={1}>
            <Button
              onClick={handleVisibleChange}
              className={menuClasses.imageLayerVisibleButton}
              aria-label="Toggle layer visibility"
            >
              <Visibility />
            </Button>
          </Grid>
          <Grid size={1}>
            <ChannelColorPickerMenu
              theme={theme}
              color={color}
              setColor={setColor}
              palette={palette}
              isStaticColor={isStaticColor}
              isColormap={isColormap}
              featureValueColormap={featureValueColormap}
              visible={visible}
            />
          </Grid>
          <Grid size={6}>
            <Typography className={menuClasses.imageLayerName}>
              {label}
            </Typography>
          </Grid>
          <Grid size={2}>
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
          <Grid size={1}>
            <PointLayerEllipsisMenu
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
          <Grid size={1}>
            <PointsIconSVG className={classes.layerTypePointIcon} />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}
