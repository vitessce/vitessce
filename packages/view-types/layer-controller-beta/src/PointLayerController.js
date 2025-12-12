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
  Button,
  NativeSelect,
  Checkbox,
  MenuItem,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore,
  ExpandLess,
  MoreVert as MoreVertIcon,
  Input,
  Box,
  InputAdornment,
  Tabs,
  Tab,
  MenuList,
  ListItemText,
  ListItemIcon,
  Palette as PaletteIcon,
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
  pointLayerButton: {
    borderStyle: 'dashed',
    marginTop: '10px',
    marginBottom: '10px',
    fontWeight: 400,
  },
  pointFeatureControllerGrid: {
    padding: '0',
    flexWrap: 'nowrap',
  },
  pointFeatureExpansionButton: {
    display: 'inline-block',
    margin: 0,
    padding: 0,
    minWidth: 0,
    lineHeight: 1,
    width: '50%',
  },
  layerTypePointIcon: {
    height: '100%',
    paddingLeft: '2px',
    fill: 'currentColor',
    fontSize: '14px',
    width: '50%',
    maxWidth: '16px',
  },
}));

function PointLayerEllipsisMenu(props) {
  const {
    featureSelection,
    featureFilterMode,
    setFeatureFilterMode,
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
  const featureFilterModeId = useId();

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
          <option value="geneSelection">Feature Color</option>
          <option value="randomByFeature">Random Color per Feature</option>
          <option value="random">Random Color per Point</option>
        </NativeSelect>
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={featureFilterModeId}>
          Filter to Feature Selection:&nbsp;
        </label>
        <Checkbox
          color="primary"
          className={menuClasses.menuItemCheckbox}
          checked={featureFilterMode === 'featureSelection'}
          onChange={(e, v) => setFeatureFilterMode(v ? 'featureSelection' : null)}
          slotProps={{ input: { id: featureFilterModeId, 'aria-label': 'Toggle feature filter mode' } }}
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
    pointMatrixIndicesData,
  } = props;

  const [open, setOpen] = useState(true); // TODO: make false after development

  const {
    obsType,
    spatialLayerVisible: visible,
    spatialLayerOpacity: opacity,
    obsColorEncoding,
    featureColor,
    featureFilterMode,
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
    setFeatureColor,
    setFeatureFilterMode,
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
  const handleOpenChange = useCallback(() => setOpen(prev => !prev), []);

  const enableFeaturesAndSetsDropdown = true;

  const [coloringTabIndex, setColoringTabIndex] = useState(0);

  const handleColoringTabChange = (event, newValue) => {
    setColoringTabIndex(newValue);
  };

  // We only match on FEATURE_TYPE, so only the featureIndex
  // will be relevant/correct here.
  const { featureIndex } = pointMatrixIndicesData || {};

  console.log(featureIndex);

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
              featureFilterMode={featureFilterMode}
              setFeatureFilterMode={setFeatureFilterMode}
            />
          </Grid>
          <Grid size={1} container direction="row">
            <PointsIconSVG className={classes.layerTypePointIcon} />
            {enableFeaturesAndSetsDropdown ? (
              <Button
                onClick={handleOpenChange}
                className={classes.pointFeatureExpansionButton}
                aria-label="Expand or collapse coloring controls"
              >
                {open ? <ExpandLess /> : <ExpandMore />}
              </Button>
            ) : null}
          </Grid>
        </Grid>
        {enableFeaturesAndSetsDropdown && open ? (
          <Grid
            container
            direction="column"
            justifyContent="space-between"
            className={classes.pointFeatureControllerGrid}
          >
            <Tabs value={coloringTabIndex} onChange={handleColoringTabChange} aria-label="basic tabs example">
              <Tab label="Feature List" />
            </Tabs>
            {coloringTabIndex === 0 && (
              <Grid size={12} container direction="column">
                <MenuList style={{ maxHeight: '200px', overflowY: 'auto' }} dense>
                  {featureIndex && featureIndex.length > 0 ? featureIndex.map((featureName) => (
                    <MenuItem
                      key={featureName}
                    >
                      <ListItemIcon>
                        {/* TODO: deterministically assign colors based on feature index using same method here as in Spatial view implementation */}
                        <PaletteIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>{featureName}</ListItemText>
                    </MenuItem>
                  )) : null}
                </MenuList>
              </Grid>
            )}
          </Grid>
        ) : null}
      </Paper>
    </Grid>
  );
}
