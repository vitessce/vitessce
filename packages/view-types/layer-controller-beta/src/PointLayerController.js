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
  LinearProgress,
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
    tiledPointsLoadingProgress,
  } = props;

  const [open, setOpen] = useState(false); // TODO: make false after development

  const loadingDoneFraction = useMemo(() => {
    if (tiledPointsLoadingProgress && typeof tiledPointsLoadingProgress === 'object') {
      return 1.0 - (
        Object.values(tiledPointsLoadingProgress).filter(status => status === 'loading').length
        / Object.values(tiledPointsLoadingProgress).length
      );
    }
    return 1.0;
  }, [tiledPointsLoadingProgress]);

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
    spatialLayerColor,
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
    setSpatialLayerColor,
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

  const hasUnspecifiedFeatureColors = useMemo(() => {
    if (Array.isArray(featureSelection)) {
      if (Array.isArray(featureColor)) {
        // Check that each selected feature has a specified color.
        // When we find one that does not, we can return true.
        return featureSelection.some((featureName) => {
          const colorForFeature = featureColor.find(fc => fc.name === featureName);
          return !colorForFeature;
        });
      }
      // There are features selected, but featureColor is not an array,
      // so we can assume all features lack specified colors.
      return featureSelection.length > 0;
    }
    return true;
  }, [featureColor, featureSelection]);

  const isStaticColor = (
    obsColorEncoding === 'spatialLayerColor'
    || obsColorEncoding === 'geneSelection'
  );
  const showStaticColor = (
    obsColorEncoding === 'spatialLayerColor'
    || (obsColorEncoding === 'geneSelection' && hasUnspecifiedFeatureColors)
  );
  const isColormap = false; // We do not yet support quantitative colormaps for points.

  // If the feature color encoding is "geneSelection" and there is only one feature selected,
  // we can use the first feature's color as the static color, and hook up the featureColor setter
  // for that feature in the featureColor array.
  const hasSingleSelectedFeature = (
    obsColorEncoding === 'geneSelection'
    && Array.isArray(featureSelection)
    && featureSelection.length === 1
  );
  const color = useMemo(() => {
    if (showStaticColor) {
      return spatialLayerColor;
    }
    if (hasSingleSelectedFeature) {
      const selectedFeatureColor = featureColor
        ?.find(fc => fc.name === featureSelection[0])?.color;
      if (selectedFeatureColor) {
        return selectedFeatureColor;
      }
    }
    return null;
  }, [hasSingleSelectedFeature, spatialLayerColor, featureColor,
    featureSelection, showStaticColor,
  ]);
  const setColor = useCallback((newColor) => {
    if (showStaticColor) {
      setSpatialLayerColor(newColor);
    } else if (hasSingleSelectedFeature) {
      const featureColorIndex = featureColor
        ?.findIndex(fc => fc.name === featureSelection[0]);
      if (featureColorIndex !== undefined && featureColorIndex >= 0) {
        // Update existing feature color.
        const newFeatureColor = [...featureColor];
        newFeatureColor[featureColorIndex] = {
          name: featureSelection[0],
          color: newColor,
        };
        setFeatureColor(newFeatureColor);
      } else {
        // Add new feature color.
        setFeatureColor([
          ...featureColor,
          { name: featureSelection[0], color: newColor },
        ]);
      }
    }
  }, [hasSingleSelectedFeature, setSpatialLayerColor, featureColor,
    setFeatureColor, featureSelection, showStaticColor,
  ]);

  const { classes } = useStyles();
  const { classes: lcClasses } = useControllerSectionStyles();
  const { classes: menuClasses } = useEllipsisMenuStyles();

  const handleVisibleChange = useCallback(() => {
    const nextVisible = typeof visible === 'boolean' ? !visible : false;
    setVisible(nextVisible);
  }, [visible, setVisible]);

  const handleOpacityChange = useCallback((e, v) => setOpacity(v), [setOpacity]);
  const handleOpenChange = useCallback(() => setOpen(prev => !prev), []);

  const enableFeaturesAndSetsDropdown = false;

  const [coloringTabIndex, setColoringTabIndex] = useState(0);

  const handleColoringTabChange = (event, newValue) => {
    setColoringTabIndex(newValue);
  };

  // We only match on FEATURE_TYPE, so only the featureIndex
  // will be relevant/correct here.
  const { featureIndex } = pointMatrixIndicesData || {};

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
        {loadingDoneFraction < 1.0 ? (
          <Grid
            size={12}
            container
            direction="column"
            justifyContent="space-between"
            className={classes.pointFeatureControllerGrid}
          >
            <LinearProgress
              variant={loadingDoneFraction === 0.0 ? 'indeterminate' : 'determinate'}
              value={loadingDoneFraction * 100.0}
            />
          </Grid>
        ) : null}
        {enableFeaturesAndSetsDropdown && open ? (
          <Grid
            container
            direction="column"
            justifyContent="space-between"
            className={classes.pointFeatureControllerGrid}
          >
            <Tabs
              value={coloringTabIndex}
              onChange={handleColoringTabChange}
              aria-label="Tabs for coloring by feature or set"
            >
              <Tab label="Feature List" />
            </Tabs>
            {coloringTabIndex === 0 && (
              <Grid size={12} container direction="column">
                <MenuList style={{ maxHeight: '200px', overflowY: 'auto' }} dense>
                  {featureIndex && featureIndex.length > 0 ? featureIndex.map(featureName => (
                    <MenuItem
                      key={featureName}
                    >
                      <ListItemIcon>
                        {/*
                        TODO: deterministically assign colors based on feature index
                        using same method here as in Spatial view implementation
                        */}
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
