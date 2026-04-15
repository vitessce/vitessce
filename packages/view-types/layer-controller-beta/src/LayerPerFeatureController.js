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
  LayerFeatureControllerGrid: {
    padding: '0',
    flexWrap: 'nowrap',
  },
  LayerFeatureExpansionButton: {
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

  const paletteColor = useMemo(() => {
    const varIndex = featureIndex?.indexOf(featureName) ?? -1;
    return varIndex >= 0 ? PALETTE[varIndex % PALETTE.length] : [255, 255, 255];
  }, [featureIndex, featureName]);

  const color = featureEntry?.color ?? paletteColor;
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
        { name: featureName, color: paletteColor, visible: true, opacity: 1.0, ...patch },
      ]);
    }
  }, [featureName, featureColor, setFeatureColor, paletteColor]);

  const { classes } = useStyles();
  const { classes: lcClasses } = useControllerSectionStyles();
  const { classes: menuClasses } = useEllipsisMenuStyles();


  const enableFeaturesAndSetsDropdown = false;
  const [open, setOpen] = useState(false);


  const { colorPickerColor, colorPickerDisabled, colorPickerTooltip } = useMemo(() => {
    if (obsColorEncoding === 'geneSelection') {
      return {
        colorPickerColor: color,
        colorPickerDisabled: false,
        colorPickerTooltip: null,
      };
    }
    if (obsColorEncoding === 'spatialLayerColor') {
      return {
        colorPickerColor: spatialLayerColor,
        colorPickerDisabled: true,
        colorPickerTooltip: 'Currently using the static color value from the parent (Point) layer. Per-feature colors can be modified when the Color Encoding mode is "Feature Color" in the parent layer.',
      };
    }
    if (obsColorEncoding === 'randomByFeature') {
      const varIndex = featureIndex?.indexOf(featureName) ?? -1;
      const randomColor = varIndex >= 0
        ? PALETTE[varIndex % PALETTE.length]
        : [128, 128, 128];
      return {
        colorPickerColor: randomColor,
        colorPickerDisabled: true,
        colorPickerTooltip: 'Currently using the assigned random color. Per-feature colors can be modified when the Color Encoding mode is "Feature Color".',
      };
    }
    if (obsColorEncoding === 'random') {
      return {
        colorPickerColor: null,
        colorPickerDisabled: true,
        colorPickerTooltip: 'Currently using a random color per point. Per-feature colors can be modified when the Color Encoding mode is "Feature Color".',
      };
    }
    return { colorPickerColor: color, colorPickerDisabled: false, colorPickerTooltip: null };
  }, [obsColorEncoding, color, spatialLayerColor, featureName]);


  return (
    <Grid key={featureName} className={lcClasses.layerControllerGrid}>
      <Paper elevation={2} className={lcClasses.layerControllerSubRow}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid size={1}>
            <Button
              onClick={() => {
                setFeatureSelection(featureSelection.filter(f => f !== featureName));
                setFeatureColor(featureColor?.filter(fc => fc.name !== featureName) ?? []);
              }}
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
                  setColor={colorPickerDisabled
                    ? () => {} : newColor => updateFeatureEntry({ color: newColor })}
                  palette={palette}
                  isStaticColor={!colorPickerDisabled}
                  isColormap={false}
                  featureValueColormap={featureValueColormap}
                  visible={visible}
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
              onChange={(e, v) => updateFeatureEntry({ opacity: v })}
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
