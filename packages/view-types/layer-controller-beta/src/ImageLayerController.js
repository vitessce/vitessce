/* eslint-disable jsx-a11y/label-has-associated-control */
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
  Image as ImageIcon,
  ExpandMore,
  ExpandLess,
  MoreVert as MoreVertIcon,
} from '@vitessce/styles';
import { viv } from '@vitessce/gl';
import {
  useAddImageChannelInMetaCoordinationScopes,
  PopperMenu,
} from '@vitessce/vit-s';
import { COLORMAP_OPTIONS, formatBytes } from '@vitessce/utils';
import {
  useControllerSectionStyles,
  useSelectStyles,
  useEllipsisMenuStyles,
} from './styles.js';
import ImageChannelController from './ImageChannelController.js';
import ClippingSliders from './ClippingSliders.js';


const useStyles = makeStyles()(() => ({
  imageLayerButton: {
    borderStyle: 'dashed',
    marginTop: '10px',
    marginBottom: '10px',
    fontWeight: 400,
  },
  imageChannelControllerGrid: {
    padding: '0',
    flexWrap: 'nowrap',
  },
  channelExpansionButton: {
    display: 'inline-block',
    margin: 0,
    padding: 0,
    minWidth: 0,
    lineHeight: 1,
    width: '50%',
  },
  layerTypeImageIcon: {
    height: '100%',
    width: '50%',
    maxWidth: '24px',
  },
  clippingPanesLabel: {
    marginBottom: '0 !important',
  },
  clippingSliders: {
    padding: '0 8px',

  },
}));

function ImageLayerEllipsisMenu(props) {
  const {
    colormap,
    setColormap,
    photometricInterpretation,
    setPhotometricInterpretation,
    spatialTargetResolution,
    setSpatialTargetResolution,
    volumetricRenderingAlgorithm,
    setVolumetricRenderingAlgorithm,
    spatialLayerTransparentColor,
    setSpatialLayerTransparentColor,
    spatialRenderingMode,
    image,
    channelScopes,
    tooltipsVisible,
    setTooltipsVisible,
    channelLabelsVisible,
    setChannelLabelsVisible,
    channelLabelsOrientation,
    setChannelLabelsOrientation,
    channelLabelSize,
    setChannelLabelSize,
  } = props;
  const [open, setOpen] = useState(false);
  const { classes: selectClasses } = useSelectStyles();
  const { classes: menuClasses } = useEllipsisMenuStyles();

  const is3dMode = spatialRenderingMode === '3D';
  const isMultiResolution = image?.isMultiResolution();
  const multiResolutionStats = image?.getMultiResolutionStats();

  function handleColormapChange(event) {
    setColormap(event.target.value === '' ? null : event.target.value);
  }

  function handleInterpretationChange(event) {
    setPhotometricInterpretation(event.target.value);
  }

  function handleVolumetricChange(event) {
    setVolumetricRenderingAlgorithm(event.target.value);
  }

  function handleResolutionChange(event) {
    setSpatialTargetResolution(
      event.target.value !== null ? parseInt(event.target.value, 10) : null,
    );
  }

  function handleChannelLabelsOrientationChange(event) {
    setChannelLabelsOrientation(event.target.value);
  }

  const colormapId = useId();
  const interpretationId = useId();
  const transparentId = useId();
  const volumetricId = useId();
  const resolutionId = useId();
  const tooltipsVisibleId = useId();
  const channelLabelsVisibleId = useId();
  const channelLabelsOrientationId = useId();
  const channelLabelSizeId = useId();

  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<MoreVertIcon />}
      buttonClassName={menuClasses.imageLayerMenuButton}
      containerClassName={menuClasses.imageLayerPopperContainer}
      withPaper
      aria-label="Open image layer options menu"
    >
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={colormapId}>
          Colormap:&nbsp;
        </label>
        <NativeSelect
          disabled={photometricInterpretation === 'RGB'}
          onChange={handleColormapChange}
          value={colormap === null ? '' : colormap}
          inputProps={{ id: colormapId, 'aria-label': 'Colormap selector' }}
          classes={{ root: selectClasses.selectRoot }}
        >
          <option aria-label="None" value="">None</option>
          {COLORMAP_OPTIONS.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </NativeSelect>
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={interpretationId}>
          Photometric Interpretation:&nbsp;
        </label>
        <NativeSelect
          onChange={handleInterpretationChange}
          value={photometricInterpretation}
          inputProps={{ id: interpretationId, 'aria-label': 'Photometric interpretation selector' }}
          classes={{ root: selectClasses.selectRoot }}
        >
          <option aria-label="RGB" value="RGB">RGB</option>
          {channelScopes.length > 0 ? (
            <option aria-label="BlackIsZero" value="BlackIsZero">BlackIsZero</option>
          ) : null}
        </NativeSelect>
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={transparentId}>
          Zero Transparent:&nbsp;
        </label>
        <Checkbox
          color="primary"
          checked={spatialLayerTransparentColor !== null}
          onChange={(e, v) => setSpatialLayerTransparentColor(v ? ([0, 0, 0]) : null)}
          slotProps={{ input: { id: transparentId, 'aria-label': 'Render zero-value pixels as transparent' } }}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={volumetricId}>
          Volumetric Rendering:&nbsp;
        </label>
        <NativeSelect
          onChange={handleVolumetricChange}
          value={volumetricRenderingAlgorithm}
          inputProps={{ id: volumetricId, 'aria-label': 'Volumetric rendering algorithm selector' }}
          classes={{ root: selectClasses.selectRoot }}
          disabled={!is3dMode}
        >
          <option aria-label="Additive" value="additive">Additive</option>
          <option aria-label="Maximum Intensity Projection" value="maximumIntensityProjection">Maximum Intensity Projection</option>
        </NativeSelect>
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={resolutionId}>
          Volume Resolution:&nbsp;
        </label>
        <NativeSelect
          disabled={!is3dMode || !isMultiResolution}
          onChange={handleResolutionChange}
          value={spatialTargetResolution === null ? 'auto' : spatialTargetResolution}
          inputProps={{ id: resolutionId, 'aria-label': 'Volumetric resolution selector' }}
          classes={{ root: selectClasses.selectRoot }}
        >
          <option value="auto">Auto</option>
          {Array.isArray(multiResolutionStats) ? multiResolutionStats.map((stats, resolution) => (
            stats.canLoad ? (
              <option
                key={`(${stats.height}, ${stats.width}, ${stats.depthDownsampled})`}
                value={resolution}
              >
                {`3D: ${resolution}x Downsampled, ~${formatBytes(
                  stats.totalBytes,
                )} per channel, (${stats.height}, ${stats.width}, ${stats.depthDownsampled})`}
              </option>
            ) : null)) : null}
        </NativeSelect>
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={tooltipsVisibleId}>
          Tooltips Visible:&nbsp;
        </label>
        <Checkbox
          color="primary"
          checked={tooltipsVisible}
          onChange={(e, v) => setTooltipsVisible(v)}
          slotProps={{ input: { id: tooltipsVisibleId, 'aria-label': 'Render pixel value tooltips' } }}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={channelLabelsVisibleId}>
          Channel Labels Visible:&nbsp;
        </label>
        <Checkbox
          disabled={photometricInterpretation === 'RGB'}
          color="primary"
          checked={channelLabelsVisible}
          onChange={(e, v) => setChannelLabelsVisible(v)}
          slotProps={{ input: { id: channelLabelsVisibleId, 'aria-label': 'Render channel labels' } }}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={channelLabelsOrientationId}>
          Channel Labels Orientation:&nbsp;
        </label>
        <NativeSelect
          disabled={photometricInterpretation === 'RGB'}
          onChange={handleChannelLabelsOrientationChange}
          value={channelLabelsOrientation}
          inputProps={{ id: channelLabelsOrientationId, 'aria-label': 'Channel labels orientation selector' }}
          classes={{ root: selectClasses.selectRoot }}
        >
          <option aria-label="Vertical" value="vertical">Vertical</option>
          <option aria-label="Horizontal" value="horizontal">Horizontal</option>
        </NativeSelect>
      </MenuItem>
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={channelLabelSizeId}>
          Channel Labels Size:&nbsp;
        </label>
        <Slider
          disabled={photometricInterpretation === 'RGB'}
          value={channelLabelSize}
          min={8}
          max={36}
          step={1}
          onChange={(e, v) => setChannelLabelSize(v)}
          className={menuClasses.menuItemSlider}
          orientation="horizontal"
          id={channelLabelSizeId}
          aria-label="Channel labels text size slider"
        />
      </MenuItem>
    </PopperMenu>
  );
}

export default function ImageLayerController(props) {
  const {
    theme,
    coordinationScopesRaw,
    layerScope,
    layerCoordination,
    setLayerCoordination,
    channelScopes,
    channelCoordination,
    setChannelCoordination,
    image,
    featureIndex,
    targetT,
    targetZ,
    spatialRenderingMode,
  } = props;

  const [open, setOpen] = useState(true);

  const {
    spatialLayerVisible: visible,
    spatialLayerOpacity: opacity,
    spatialLayerColormap: colormap,
    photometricInterpretation,
    spatialTargetResolution,
    volumetricRenderingAlgorithm,
    spatialLayerTransparentColor,
    spatialSliceX,
    spatialSliceY,
    spatialSliceZ,
    tooltipsVisible,
    spatialChannelLabelsVisible: channelLabelsVisible,
    spatialChannelLabelsOrientation: channelLabelsOrientation,
    spatialChannelLabelSize: channelLabelSize,
  } = layerCoordination;
  const {
    setSpatialLayerVisible: setVisible,
    setSpatialLayerOpacity: setOpacity,
    setSpatialLayerColormap: setColormap,
    setPhotometricInterpretation,
    setSpatialTargetResolution,
    setVolumetricRenderingAlgorithm,
    setSpatialLayerTransparentColor,
    setSpatialSliceX,
    setSpatialSliceY,
    setSpatialSliceZ,
    setTooltipsVisible,
    setSpatialChannelLabelsVisible: setChannelLabelsVisible,
    setSpatialChannelLabelsOrientation: setChannelLabelsOrientation,
    setSpatialChannelLabelSize: setChannelLabelSize,
  } = setLayerCoordination;

  const addChannel = useAddImageChannelInMetaCoordinationScopes();

  const visibleSetting = typeof visible === 'boolean' ? visible : true;
  const Visibility = useMemo(() => (
    visibleSetting
      ? VisibilityIcon
      : VisibilityOffIcon
  ), [visibleSetting]);

  const label = image?.getName();
  const imageNumChannels = image?.getNumChannels();
  const is3dMode = spatialRenderingMode === '3D';

  const handleChannelAdd = useCallback(() => {
    addChannel(
      coordinationScopesRaw,
      layerScope,
    );
  }, [addChannel, coordinationScopesRaw, layerScope]);

  const handleVisibleChange = useCallback(() => {
    const nextVisible = typeof visible === 'boolean' ? !visible : false;
    setVisible(nextVisible);
  }, [visible, setVisible]);

  const handleOpacityChange = useCallback((e, v) => setOpacity(v), [setOpacity]);
  const handleOpenChange = useCallback(() => setOpen(prev => !prev), []);

  const { classes } = useStyles();
  const { classes: menuClasses } = useEllipsisMenuStyles();
  const { classes: controllerSectionClasses } = useControllerSectionStyles();
  const isMultiChannel = photometricInterpretation !== 'RGB';
  return (
    <Grid className={controllerSectionClasses.layerControllerGrid}>
      <Paper elevation={4} className={controllerSectionClasses.layerControllerRoot}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid size={1}>
            <Button
              className={menuClasses.imageLayerVisibleButton}
              onClick={handleVisibleChange}
              aria-label="Toggle layer visibility"
            >
              <Visibility />
            </Button>
          </Grid>
          <Grid size={1} />
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
            <ImageLayerEllipsisMenu
              colormap={colormap}
              setColormap={setColormap}
              photometricInterpretation={photometricInterpretation}
              setPhotometricInterpretation={setPhotometricInterpretation}
              spatialTargetResolution={spatialTargetResolution}
              setSpatialTargetResolution={setSpatialTargetResolution}
              volumetricRenderingAlgorithm={volumetricRenderingAlgorithm}
              setVolumetricRenderingAlgorithm={setVolumetricRenderingAlgorithm}
              spatialLayerTransparentColor={spatialLayerTransparentColor}
              setSpatialLayerTransparentColor={setSpatialLayerTransparentColor}
              spatialRenderingMode={spatialRenderingMode}
              image={image}
              channelScopes={channelScopes}
              tooltipsVisible={tooltipsVisible}
              setTooltipsVisible={setTooltipsVisible}
              channelLabelsVisible={channelLabelsVisible}
              setChannelLabelsVisible={setChannelLabelsVisible}
              channelLabelsOrientation={channelLabelsOrientation}
              setChannelLabelsOrientation={setChannelLabelsOrientation}
              channelLabelSize={channelLabelSize}
              setChannelLabelSize={setChannelLabelSize}
            />
          </Grid>
          <Grid size={1} container direction="row">
            <ImageIcon className={classes.layerTypeImageIcon} />
            {isMultiChannel ? (
              <Button
                onClick={handleOpenChange}
                className={classes.channelExpansionButton}
                aria-label="Expand or collapse channel controls"
              >
                {open ? <ExpandLess /> : <ExpandMore />}
              </Button>
            ) : null}
          </Grid>
        </Grid>
        {isMultiChannel && open ? (
          <Grid
            container
            direction="column"
            justifyContent="space-between"
            className={classes.imageChannelControllerGrid}
          >
            {channelScopes.map((cScope) => {
              const {
                spatialTargetC,
                spatialChannelVisible,
                spatialChannelOpacity,
                spatialChannelColor,
                spatialChannelWindow,
              } = channelCoordination[cScope];
              const {
                setSpatialTargetC,
                setSpatialChannelVisible,
                setSpatialChannelOpacity,
                setSpatialChannelColor,
                setSpatialChannelWindow,
              } = setChannelCoordination[cScope];

              const channelIndex = image?.getChannelIndex(spatialTargetC);

              return (
                <ImageChannelController
                  key={cScope}
                  theme={theme}
                  coordinationScopesRaw={coordinationScopesRaw}
                  layerScope={layerScope}
                  channelScope={cScope}
                  targetT={targetT}
                  targetZ={targetZ}
                  targetC={channelIndex}
                  setTargetC={setSpatialTargetC}
                  visible={spatialChannelVisible}
                  setVisible={setSpatialChannelVisible}
                  opacity={spatialChannelOpacity}
                  setOpacity={setSpatialChannelOpacity}
                  color={spatialChannelColor}
                  setColor={setSpatialChannelColor}
                  window={spatialChannelWindow}
                  setWindow={setSpatialChannelWindow}
                  colormapOn={colormap !== null}
                  featureIndex={featureIndex}
                  image={image}
                  spatialRenderingMode={spatialRenderingMode}
                />
              );
            })}
            <Button
              disabled={(
                channelScopes.length === viv.MAX_CHANNELS
                || channelScopes.length === imageNumChannels
              )}
              onClick={handleChannelAdd}
              fullWidth
              variant="outlined"
              className={classes.imageLayerButton}
              startIcon={<AddIcon />}
              size="small"
              aria-label="Add a channel to this layer"
            >
              Add Channel
            </Button>
          </Grid>
        ) : null}
        {is3dMode && image ? (
          <Grid
            container
            direction="column"
            justifyContent="space-between"
            className={classes.imageChannelControllerGrid}
          >
            <Typography className={classes.clippingPanesLabel}>Clipping planes:</Typography>
            <Grid size={12} className={classes.clippingSliders}>
              <ClippingSliders
                image={image}
                spatialSliceX={spatialSliceX}
                spatialSliceY={spatialSliceY}
                spatialSliceZ={spatialSliceZ}
                setSpatialSliceX={setSpatialSliceX}
                setSpatialSliceY={setSpatialSliceY}
                setSpatialSliceZ={setSpatialSliceZ}
              />
            </Grid>
          </Grid>
        ) : null}
      </Paper>
    </Grid>
  );
}
