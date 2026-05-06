/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useMemo } from 'react';
import { useId } from 'react-aria';
import {
  makeStyles,
  Grid,
  Checkbox,
  Paper,
  Typography,
  Slider,
  MenuItem,
  Button,
  NativeSelect,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@vitessce/styles';
import { PopperMenu } from '@vitessce/vit-s';
import { VectorIconSVG } from '@vitessce/icons';
import { GLSL_COLORMAPS } from '@vitessce/gl';
import { CoordinationType } from '@vitessce/constants-internal';
import {
  useControllerSectionStyles,
  useEllipsisMenuStyles,
  useSelectStyles,
} from './styles.js';
import ChannelColorPickerMenu from './ChannelColorPickerMenu.js';

const useStyles = makeStyles()(() => ({
  layerTypeCentroidSegmentationIcon: {
    height: '100%',
    marginLeft: '1px',
    fill: 'currentColor',
    fontSize: '24px',
    width: '50%',
    maxWidth: '24px',
  },
  divider: {
    width: '1px',
    height: '20px',
    background: 'currentColor',
    flexShrink: 0,
    margin: '0 10px',
  },
  inlineLabel: {
    margin: '0px !important',
    lineHeight: 1,
    alignSelf: 'center',
  },
  iconCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

function CombinedEllipsisMenu(props) {
  const {
    obsType,
    featureType,
    featureValueType,
    filled,
    setFilled,
    strokeWidth,
    setStrokeWidth,
    obsColorEncoding,
    setObsColorEncoding,
    featureValueColormap,
    setFeatureValueColormap,
    featureValueColormapRange,
    setFeatureValueColormapRange,
    tooltipsVisible,
    setTooltipsVisible,
    tooltipCrosshairsVisible,
    setTooltipCrosshairsVisible,
    legendVisible,
    setLegendVisible,
    setPointObsColorEncoding,
    setPointFeatureValueColormap,
    setPointFeatureValueColormapRange,
    onColorEncodingChange,
  } = props;

  const [open, setOpen] = useState(false);
  const { classes: selectClasses } = useSelectStyles();
  const { classes: menuClasses } = useEllipsisMenuStyles();

  const filledId = useId();
  const strokeWidthId = useId();
  const colorEncodingId = useId();
  const colormapId = useId();
  const colormapRangeId = useId();
  const tooltipsId = useId();
  const crosshairsId = useId();
  const legendId = useId();

  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<MoreVertIcon />}
      buttonClassName={menuClasses.imageLayerMenuButton}
      containerClassName={menuClasses.imageLayerPopperContainer}
      withPaper
      getAriaLabel={() => 'Open combined centroid and segmentation layer options menu'}
    >
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={filledId}>Filled:&nbsp;</label>
        <Checkbox
          color="primary"
          className={menuClasses.menuItemCheckbox}
          checked={filled}
          onChange={(e, v) => setFilled(v)}
          slotProps={{ input: { id: filledId } }}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label
          className={menuClasses.imageLayerMenuLabel}
          htmlFor={strokeWidthId}
        >Stroke width:
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
          getAriaLabel={() => 'Stroke width'}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label
          className={menuClasses.imageLayerMenuLabel}
          htmlFor={colorEncodingId}
        >Color encoding:&nbsp;
        </label>
        <NativeSelect
          onChange={onColorEncodingChange}
          value={obsColorEncoding}
          inputProps={{ id: colorEncodingId }}
          classes={{ root: selectClasses.selectRoot }}
        >
          <option value="spatialChannelColor">Static Color</option>
          <option value="geneSelection">Feature Value</option>
          <option value="cellSetSelection">Set Selection</option>
        </NativeSelect>
      </MenuItem>
      <MenuItem dense disableGutters>
        <label
          className={menuClasses.imageLayerMenuLabel}
          htmlFor={colormapId}
        >Colormap:&nbsp;
        </label>
        <NativeSelect
          onChange={(e) => {
            setFeatureValueColormap(e.target.value);
            setPointFeatureValueColormap?.(e.target.value);
          }}
          value={featureValueColormap}
          inputProps={{ id: colormapId }}
          classes={{ root: selectClasses.selectRoot }}
        >
          {GLSL_COLORMAPS.map(cmap => (
            <option key={cmap} value={cmap}>{cmap}</option>
          ))}
        </NativeSelect>
      </MenuItem>
      <MenuItem dense disableGutters>
        <label
          className={menuClasses.imageLayerMenuLabel}
          htmlFor={colormapRangeId}
        >Colormap range:&nbsp;
        </label>
        <Slider
          disabled={obsColorEncoding !== 'geneSelection'}
          value={featureValueColormapRange}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(e, v) => {
            setFeatureValueColormapRange(v);
            setPointFeatureValueColormapRange?.(v);
          }}
          className={menuClasses.menuItemSlider}
          orientation="horizontal"
          id={colormapRangeId}
          getAriaLabel={i => (i === 0 ? 'Low colormap range' : 'High colormap range')}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label
          className={menuClasses.imageLayerMenuLabel}
          htmlFor={tooltipsId}
        >Tooltips visible:&nbsp;
        </label>
        <Checkbox
          color="primary"
          className={menuClasses.menuItemCheckbox}
          checked={tooltipsVisible}
          onChange={(e, v) => setTooltipsVisible(v)}
          slotProps={{ input: { id: tooltipsId } }}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label
          className={menuClasses.imageLayerMenuLabel}
          htmlFor={crosshairsId}
        >Crosshairs visible:&nbsp;
        </label>
        <Checkbox
          color="primary"
          className={menuClasses.menuItemCheckbox}
          checked={tooltipCrosshairsVisible}
          onChange={(e, v) => setTooltipCrosshairsVisible(v)}
          slotProps={{ input: { id: crosshairsId } }}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label
          className={menuClasses.imageLayerMenuLabel}
          htmlFor={legendId}
        >Legend visible:&nbsp;
        </label>
        <Checkbox
          color="primary"
          className={menuClasses.menuItemCheckbox}
          checked={legendVisible}
          onChange={(e, v) => setLegendVisible(v)}
          slotProps={{ input: { id: legendId } }}
        />
      </MenuItem>
    </PopperMenu>
  );
}

export default function SegmentationCentroidsController(props) {
  const {
    theme,
    segScope,
    segLayerCoordination,
    segChannelScopesByLayer,
    segChannelCoordination,
    pointScope,
    pointLayerCoordination,
  } = props;

  const { classes } = useStyles();
  const { classes: lcClasses } = useControllerSectionStyles();
  const { classes: menuClasses } = useEllipsisMenuStyles();

  // ── Seg channel (first/only channel drives the shared controls) ──────────
  const channelScopes = segChannelScopesByLayer?.[segScope] ?? [];
  const primaryChanScope = channelScopes[0];

  const chanValues = segChannelCoordination[0]?.[segScope]?.[primaryChanScope] ?? {};
  const chanSetters = segChannelCoordination[1]?.[segScope]?.[primaryChanScope] ?? {};

  const {
    obsType,
    featureType,
    featureValueType,
    spatialChannelVisible: segVisible,
    spatialChannelOpacity: segOpacity,
    spatialChannelColor: segColor,
    spatialSegmentationFilled: filled,
    spatialSegmentationStrokeWidth: strokeWidth,
    obsColorEncoding,
    featureSelection,
    featureValueColormap,
    featureValueColormapRange,
    tooltipsVisible,
    tooltipCrosshairsVisible,
    legendVisible,
  } = chanValues;

  const {
    setSpatialChannelVisible: setSegVisible,
    setSpatialChannelOpacity: setSegOpacity,
    setSpatialChannelColor: setSegColor,
    setSpatialSegmentationFilled: setFilled,
    setSpatialSegmentationStrokeWidth: setStrokeWidth,
    setObsColorEncoding,
    setFeatureValueColormap,
    setFeatureValueColormapRange,
    setTooltipsVisible,
    setTooltipCrosshairsVisible,
    setLegendVisible,
  } = chanSetters;

  const pointValues = pointLayerCoordination[0]?.[pointScope] ?? {};
  const pointSetters = pointLayerCoordination[1]?.[pointScope] ?? {};

  const {
    spatialLayerVisible: pointVisible,
    spatialLayerOpacity: pointOpacity,
    spatialLayerColor: pointColor,
    obsColorEncoding: pointObsColorEncoding,
    featureValueColormap: pointFeatureValueColormap,
  } = pointValues;

  const {
    setSpatialLayerVisible: setPointVisible,
    setSpatialLayerOpacity: setPointOpacity,
    setSpatialLayerColor: setPointColor,
    setObsColorEncoding: setPointObsColorEncoding,
    setFeatureValueColormap: setPointFeatureValueColormap,
    setFeatureValueColormapRange: setPointFeatureValueColormapRange,
  } = pointSetters;

  const sharedOpacity = segOpacity ?? 1;

  const handleOpacityChange = useCallback((e, v) => {
    setSegOpacity?.(v);
    setPointOpacity?.(v);
  }, [setSegOpacity, setPointOpacity]);

  // ── Individual visibility toggles
  const handleSegVisibleChange = useCallback(() => {
    setSegVisible?.(typeof segVisible === 'boolean' ? !segVisible : false);
  }, [segVisible, setSegVisible]);

  const handlePointVisibleChange = useCallback(() => {
    setPointVisible?.(typeof pointVisible === 'boolean' ? !pointVisible : false);
  }, [pointVisible, setPointVisible]);

  const handleColorEncodingChange = useCallback((e) => {
    const val = e.target.value;
    setObsColorEncoding(val);
    // Map seg encoding to the equivalent point encoding
    if (val === 'geneSelection') {
      setPointObsColorEncoding?.('quantitativeColormap');
    } else if (val === 'cellSetSelection') {
      // TODO: Need to implement this
      setPointObsColorEncoding?.('cellSetSelection');
    } else {
      setPointObsColorEncoding?.('spatialChannelColor');
    }
  }, [setObsColorEncoding, setPointObsColorEncoding]);

  const segVisibleSetting = typeof segVisible === 'boolean' ? segVisible : true;
  const pointVisibleSetting = typeof pointVisible === 'boolean' ? pointVisible : true;

  const SegVisibility = segVisibleSetting ? VisibilityIcon : VisibilityOffIcon;
  const PointVisibility = pointVisibleSetting ? VisibilityIcon : VisibilityOffIcon;

  const isStaticColor = obsColorEncoding === 'spatialChannelColor';
  const isColormap = obsColorEncoding === 'geneSelection';

  const pointIsStaticColor = pointObsColorEncoding === 'spatialChannelColor';
  const pointIsColormap = pointObsColorEncoding === 'geneSelection'
                             || pointObsColorEncoding === 'quantitativeColormap';


  return (
    <Grid className={lcClasses.layerControllerGrid}>
      <Paper elevation={4} className={lcClasses.layerControllerRoot}>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid size="grow" style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <Button
              onClick={handleSegVisibleChange}
              className={menuClasses.imageLayerVisibleButton}
              getAriaLabel={() => 'Toggle mesh visibility'}
            >
              <SegVisibility />
            </Button>
            <ChannelColorPickerMenu
              theme={theme}
              color={segColor}
              setColor={setSegColor}
              isStaticColor={isStaticColor}
              isColormap={isColormap}
              featureValueColormap={featureValueColormap}
              visible={segVisibleSetting}
            />

            <Typography className={`${menuClasses.imageLayerName} ${classes.inlineLabel}`}>
              Cell
            </Typography>

            <div className={classes.divider} />
            <Button
              onClick={handlePointVisibleChange}
              className={menuClasses.imageLayerVisibleButton}
              getAriaLabel={() => 'Toggle centroid visibility'}
            >
              <PointVisibility />
            </Button>
            <ChannelColorPickerMenu
              theme={theme}
              color={pointColor}
              setColor={setPointColor}
              isStaticColor={pointIsStaticColor}
              isColormap={pointIsColormap}
              featureValueColormap={pointFeatureValueColormap}
              visible={pointVisibleSetting}
            />
            <Typography className={`${menuClasses.imageLayerName} ${classes.inlineLabel}`}>
              Point
            </Typography>
          </Grid>
          {/* Shared opacity slider */}
          <Grid size={2}>
            <Slider
              value={sharedOpacity}
              min={0}
              max={1}
              step={0.001}
              onChange={handleOpacityChange}
              className={menuClasses.imageLayerOpacitySlider}
              orientation="horizontal"
              getAriaLabel={() => 'Adjust shared opacity'}
            />
          </Grid>

          {/* Shared ellipsis menu */}
          <Grid size={1}>
            <CombinedEllipsisMenu
              obsType={obsType}
              featureType={featureType}
              featureValueType={featureValueType}
              filled={filled}
              setFilled={setFilled}
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
              obsColorEncoding={obsColorEncoding}
              setObsColorEncoding={setObsColorEncoding}
              featureValueColormap={featureValueColormap}
              setFeatureValueColormap={setFeatureValueColormap}
              featureValueColormapRange={featureValueColormapRange}
              setFeatureValueColormapRange={setFeatureValueColormapRange}
              tooltipsVisible={tooltipsVisible}
              setTooltipsVisible={setTooltipsVisible}
              tooltipCrosshairsVisible={tooltipCrosshairsVisible}
              setTooltipCrosshairsVisible={setTooltipCrosshairsVisible}
              legendVisible={legendVisible}
              setLegendVisible={setLegendVisible}
              setPointObsColorEncoding={setPointObsColorEncoding}
              setPointFeatureValueColormap={setPointFeatureValueColormap}
              setPointFeatureValueColormapRange={setPointFeatureValueColormapRange}
              onColorEncodingChange={handleColorEncodingChange}
            />
          </Grid>
          <Grid size={1} className={classes.iconCell}>
            <VectorIconSVG className={classes.layerTypeCentroidSegmentationIcon} />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}
