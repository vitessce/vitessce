/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
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
  LinearProgress,
  Palette as PaletteIcon,
} from '@vitessce/styles';
import { PopperMenu } from '@vitessce/vit-s';
import { GeneIconSVG } from '@vitessce/icons';
import {
  useControllerSectionStyles,
  useEllipsisMenuStyles,
  useSelectStyles,
} from './styles.js';
import ChannelColorPickerMenu from './ChannelColorPickerMenu.js';

const useStyles = makeStyles()(() => ({
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

function LayerPerFeatureEllipsisMenu(props) {
  const {
    setObsColorEncoding,
    featureValueColormapRange,
    setFeatureValueColormapRange,
    tooltipsVisible,
    setTooltipsVisible,
    tooltipCrosshairsVisible,
    setTooltipCrosshairsVisible,
    legendVisible,
    setLegendVisible,
    featureFilterMode,
    setFeatureFilterMode,
    obsColorEncoding,
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

export default function LayerPerFeatureController(props) {
  const {
    theme,
    palette = null,
    featureName,
    featureColor,
    setFeatureColor,
    featureValueColormap,
    featureValueColormapRange,
    setFeatureValueColormapRange,
    obsColorEncoding,
    tooltipsVisible,
    setTooltipsVisible,
    tooltipCrosshairsVisible,
    setTooltipCrosshairsVisible,
    legendVisible,
    setLegendVisible,
    featureFilterMode,
    setFeatureFilterMode,
    tiledPointsLoadingProgress,
  } = props;


  const loadingDoneFraction = useMemo(() => {
    if (tiledPointsLoadingProgress && typeof tiledPointsLoadingProgress === 'object') {
      return 1.0 - (
        Object.values(tiledPointsLoadingProgress).filter(s => s === 'loading').length
        / Object.values(tiledPointsLoadingProgress).length
      );
    }
    return 1.0;
  }, [tiledPointsLoadingProgress]);

  const featureEntry = useMemo(() => (
    featureColor?.find(fc => fc.name === featureName)
  ), [featureColor, featureName]);

  const color = featureEntry?.color ?? [255, 255, 255];
  const visible = featureEntry?.visible ?? true;
  const opacity = featureEntry?.opacity ?? 1.0;


  const updateFeatureEntry = useCallback((patch) => {
    const idx = featureColor?.findIndex(fc => fc.name === featureName) ?? -1;
    if (idx >= 0) {
      const updated = [...featureColor];
      updated[idx] = { ...updated[idx], ...patch };
      setFeatureColor(updated);
    } else {
      setFeatureColor([
        ...(featureColor ?? []),
        { name: featureName, color: [255, 255, 255], visible: true, opacity: 1.0, ...patch },
      ]);
    }
  }, [featureName, featureColor, setFeatureColor]);

  const Visibility = visible ? VisibilityIcon : VisibilityOffIcon;

  const { classes } = useStyles();
  const { classes: lcClasses } = useControllerSectionStyles();
  const { classes: menuClasses } = useEllipsisMenuStyles();


  const enableFeaturesAndSetsDropdown = false;
  const [open, setOpen] = useState(false);


  return (
    <Grid key={featureName} className={lcClasses.layerControllerGrid}>
      <Paper elevation={2} className={lcClasses.layerControllerSubRow}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid size={1}>
            <Button
              onClick={() => updateFeatureEntry({ visible: !visible })}
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
              setColor={newColor => updateFeatureEntry({ color: newColor })}
              palette={palette}
              isStaticColor
              isColormap={false}
              featureValueColormap={featureValueColormap}
              visible={visible}
            />
          </Grid>
          <Grid size={6}>
            <Typography className={menuClasses.imageLayerName}>
              {featureName}
            </Typography>
          </Grid>
          <Grid size={2}>
            <Slider
              value={opacity}
              min={0}
              max={1}
              step={0.001}
              onChange={(e, v) => updateFeatureEntry({ opacity: v })}
              className={menuClasses.imageLayerOpacitySlider}
              orientation="horizontal"
              aria-label={`Adjust opacity for layer ${featureName}`}
            />
          </Grid>
          <Grid size={1}>
            <LayerPerFeatureEllipsisMenu
              obsColorEncoding={obsColorEncoding}
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
            <GeneIconSVG className={classes.layerTypePointIcon} />
            {enableFeaturesAndSetsDropdown ? (
              <Button
                onClick={() => setOpen(prev => !prev)}
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
      </Paper>
    </Grid>
  );
}
