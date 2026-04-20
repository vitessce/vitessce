/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
import { useState, useMemo, useCallback } from 'react';
import { PALETTE } from '@vitessce/utils';
import {
  makeStyles,
  Grid,
  Paper,
  Typography,
  Slider,
  Button,
  ClearIcon,
  ExpandMore,
  ExpandLess,
  LinearProgress,
  Tooltip,
} from '@vitessce/styles';
import { PointsIconSVG } from '@vitessce/icons';
import {
  useControllerSectionStyles,
  useEllipsisMenuStyles,
} from './styles.js';
import ChannelColorPickerMenu from './ChannelColorPickerMenu.js';


const useStyles = makeStyles()(() => ({
  layerFeatureControllerGrid: {
    padding: '0',
    flexWrap: 'nowrap',
  },
  layerFeatureExpansionButton: {
    display: 'inline-block',
    margin: 0,
    padding: 0,
    minWidth: 0,
    lineHeight: 1,
    width: '50%',
  },
  layerTypeFeatureIcon: {
    height: '100%',
    paddingLeft: '2px',
    fill: 'currentColor',
    fontSize: '14px',
    width: '50%',
    maxWidth: '16px',
  },
}));


export default function LayerPerFeatureController(props) {
  const {
    theme,
    palette = null,
    featureName,
    featureColor,
    setFeatureColor,
    featureValueColormap,
    featureSelection,
    setFeatureSelection,
    spatialLayerColor,
    featureIndex,
    obsColorEncoding,
    loadingDoneFraction,
    opacity,
    handleOpacityChange,
  } = props;

  const featureColorIndex = useMemo(() => (
    featureColor?.findIndex(fc => fc.name === featureName) ?? -1
  ), [featureColor, featureName]);

  const varIndex = useMemo(() => (
    featureIndex?.indexOf(featureName) ?? -1
  ), [featureIndex, featureName]);

  const randomByFeatureColor = useMemo(() => (
    varIndex >= 0
      ? PALETTE[varIndex % PALETTE.length]
      : [255, 255, 255] // TODO: use getDefaultColor?
  ), [varIndex]);

  const handleRemoveFeature = useCallback(() => {
    setFeatureSelection(featureSelection.filter(f => f !== featureName));
  }, [featureName, featureSelection, setFeatureSelection]);

  const handleColorChange = useCallback((newColor) => {
    if (featureColorIndex >= 0) {
      const nextFeatureColor = [...featureColor];
      nextFeatureColor[featureColorIndex] = {
        ...nextFeatureColor[featureColorIndex],
        color: newColor,
      };
      setFeatureColor(nextFeatureColor);
    } else {
      // There was not already a feature color entry for this feature,
      // so we append a new entry.
      setFeatureColor([
        ...(featureColor ?? []),
        { name: featureName, color: newColor },
      ]);
    }
  }, [featureName, featureColor, setFeatureColor, featureColorIndex]);

  const { classes } = useStyles();
  const { classes: lcClasses } = useControllerSectionStyles();
  const { classes: menuClasses } = useEllipsisMenuStyles();

  const enableFeaturesAndSetsDropdown = false;
  const [open, setOpen] = useState(false);

  const { colorPickerColor, colorPickerReadable, colorPickerWritable, colorPickerTooltip } = useMemo(() => {
    if (obsColorEncoding === 'geneSelection') {
      return {
        colorPickerColor: featureColor?.[featureColorIndex]?.color ?? spatialLayerColor,
        colorPickerReadable: true,
        colorPickerWritable: true,
        colorPickerTooltip: null,
      };
    }
    if (obsColorEncoding === 'spatialLayerColor') {
      return {
        colorPickerColor: spatialLayerColor,
        colorPickerReadable: true,
        colorPickerWritable: false,
        colorPickerTooltip: 'Currently using the color value from the parent point layer. Per-feature colors can be modified when the Color Encoding mode of the parent layer is "Feature Color".',
      };
    }
    if (obsColorEncoding === 'randomByFeature') {
      return {
        colorPickerColor: randomByFeatureColor,
        colorPickerReadable: true,
        colorPickerWritable: false,
        colorPickerTooltip: 'Currently using the assigned random color. Per-feature colors can be modified when the Color Encoding mode of the parent layer is "Feature Color".',
      };
    }
    if (obsColorEncoding === 'random') {
      return {
        colorPickerColor: null,
        colorPickerReadable: false,
        colorPickerWritable: false,
        colorPickerTooltip: 'Currently using a random color per point. Per-feature colors can be modified when the Color Encoding mode of the parent layer is "Feature Color".',
      };
    }
    return {
      colorPickerColor: null,
      colorPickerReadable: false,
      colorPickerWritable: false,
      colorPickerTooltip: null,
    };
  }, [obsColorEncoding, spatialLayerColor, featureName, featureColor, featureColorIndex, randomByFeatureColor]);


  return (
    <Grid key={featureName} className={lcClasses.layerControllerGrid}>
      <Paper elevation={2} className={lcClasses.layerControllerSubRow}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid size={1}>
            <Button
              onClick={handleRemoveFeature}
              className={menuClasses.imageLayerVisibleButton}
              aria-label="Remove feature"
            >
              <ClearIcon />
            </Button>
          </Grid>
          <Grid size={1}>
            <Tooltip
              title={colorPickerTooltip ?? ''}
              disableHoverListener={!colorPickerTooltip}
              placement="top"
            >
              <span>
                <ChannelColorPickerMenu
                  theme={theme}
                  color={colorPickerColor}
                  setColor={colorPickerWritable ? handleColorChange : null}
                  palette={palette}
                  isStaticColor={colorPickerReadable}
                  isColormap={false}
                  featureValueColormap={featureValueColormap}
                  visible
                />
              </span>
            </Tooltip>
          </Grid>
          <Grid size={6}>
            <Typography className={menuClasses.imageLayerName}>
              {featureName}
            </Typography>
          </Grid>
          <Grid size={2} sx={{ paddingRight: '12px', overflow: 'visible' }}>
            <Slider
              value={opacity}
              min={0}
              max={1}
              step={0.001}
              onChange={handleOpacityChange}
              className={menuClasses.imageLayerOpacitySlider}
              orientation="horizontal"
              aria-label={`Adjust opacity for layer ${featureName}`}
            />
          </Grid>
          <Grid size={1} container direction="row">
            <PointsIconSVG className={classes.layerTypeFeatureIcon} />
            {enableFeaturesAndSetsDropdown ? (
              <Button
                onClick={() => setOpen(prev => !prev)}
                className={classes.layerFeatureExpansionButton}
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
            className={classes.layerFeatureControllerGrid}
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
