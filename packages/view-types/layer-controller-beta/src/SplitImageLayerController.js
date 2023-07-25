/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  makeStyles,
  Grid,
  Paper,
  Typography,
  Slider,
  Button,
  Select,
  InputLabel,
  Checkbox,
  MenuItem,
} from '@material-ui/core';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Image as ImageIcon,
  ExpandMore,
  ExpandLess,
  MoreVert as MoreVertIcon,
} from '@material-ui/icons';
import { viv } from '@vitessce/gl';
import {
  useAddImageChannelInMetaCoordinationScopes,
  PopperMenu,
} from '@vitessce/vit-s';
import { COLORMAP_OPTIONS, formatBytes } from '@vitessce/utils';
import { useControllerSectionStyles, useSelectStyles } from './styles.js';
import SplitImageChannelController from './SplitImageChannelController.js';


const useStyles = makeStyles(() => ({
  layerRowLabel: {
    textAlign: 'right !important',
  },
  inputLabel: {
    margin: '4px 0',
    fontSize: '14px',
    lineHeight: '21px',
  },
  imageLayerButton: {
    borderStyle: 'dashed',
    marginTop: '10px',
    fontWeight: 400,
  },
  imageLayerControllerGridContainer: {
    marginTop: '10px',
  },
  imageChannelControllerGrid: {
    padding: '10px 0',
  },
  imageLayerMenuButton: {
    backgroundColor: 'transparent',
    padding: '3px 0',
  },
  imageLayerPopperContainer: {
    display: 'flex',
    marginTop: '5px',
    justifyContent: 'space-around',
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
  } = props;
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const selectClasses = useSelectStyles();

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

  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<MoreVertIcon />}
      buttonClassName={classes.imageLayerMenuButton}
      containerClassName={classes.imageLayerPopperContainer}
      withPaper
    >
      <MenuItem dense disableGutters>
        <span style={{ margin: '0 5px' }}>Colormap: </span>
        <Select
          native
          disabled={photometricInterpretation === 'RGB'}
          onChange={handleColormapChange}
          value={colormap === null ? '' : colormap}
          inputProps={{ name: 'colormap' }}
          style={{ width: '100%', fontSize: '14px' }}
          classes={{ root: selectClasses.selectRoot }}
        >
          <option aria-label="None" value="">None</option>
          {COLORMAP_OPTIONS.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </MenuItem>
      <MenuItem dense disableGutters>
        <span style={{ margin: '0 5px' }}>Photometric Interpretation: </span>
        <Select
          native
          onChange={handleInterpretationChange}
          value={photometricInterpretation}
          inputProps={{ name: 'interpretation' }}
          style={{ width: '100%', fontSize: '14px' }}
          classes={{ root: selectClasses.selectRoot }}
        >
          <option aria-label="RGB" value="RGB">RGB</option>
          <option aria-label="BlackIsZero" value="BlackIsZero">BlackIsZero</option>
        </Select>
      </MenuItem>
      <MenuItem dense disableGutters>
        <span style={{ margin: '0 5px' }}>Zero Transparent: </span>
        <Checkbox
          color="primary"
          checked={spatialLayerTransparentColor !== null}
          onChange={(e, v) => setSpatialLayerTransparentColor(v ? ([0, 0, 0]) : null)}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <span style={{ margin: '0 5px' }}>Volumetric Rendering: </span>
        <Select
          native
          onChange={handleVolumetricChange}
          value={volumetricRenderingAlgorithm}
          inputProps={{ name: 'volumetric' }}
          style={{ width: '100%', fontSize: '14px' }}
          classes={{ root: selectClasses.selectRoot }}
          disabled={!is3dMode}
        >
          <option aria-label="Additive" value="additive">Additive</option>
          <option aria-label="Maximum Intensity Projection" value="maximumIntensityProjection">Maximum Intensity Projection</option>
        </Select>
      </MenuItem>
      <MenuItem dense disableGutters>
        <span style={{ margin: '0 5px' }}>Volume Resolution: </span>
        <Select
          native
          disabled={!is3dMode || !isMultiResolution}
          onChange={handleResolutionChange}
          value={spatialTargetResolution === null ? '0' : String(spatialTargetResolution)}
          inputProps={{ name: 'colormap' }}
          style={{ width: '100%', fontSize: '14px' }}
          classes={{ root: selectClasses.selectRoot }}
        >
          {Array.isArray(multiResolutionStats) ? multiResolutionStats.map((stats, resolution) => (
            <option
              key={`(${stats.height}, ${stats.width}, ${stats.depthDownsampled})`}
              value={resolution}
            >
              {`3D: ${resolution}x Downsampled, ~${formatBytes(
                stats.totalBytes,
              )} per channel, (${stats.height}, ${stats.width}, ${stats.depthDownsampled})`}
            </option>
          )) : null}
        </Select>
      </MenuItem>
    </PopperMenu>
  );
}

export default function SplitImageLayerController(props) {
  const {
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
  } = layerCoordination;
  const {
    setSpatialLayerVisible: setVisible,
    setSpatialLayerOpacity: setOpacity,
    setSpatialLayerColormap: setColormap,
    setPhotometricInterpretation,
    setSpatialTargetResolution,
    setVolumetricRenderingAlgorithm,
    setSpatialLayerTransparentColor,
  } = setLayerCoordination;

  const addChannel = useAddImageChannelInMetaCoordinationScopes();

  const visibleSetting = typeof visible === 'boolean' ? visible : true;
  const Visibility = visibleSetting ? VisibilityIcon : VisibilityOffIcon;

  const label = image?.getName();
  const imageNumChannels = image?.getNumChannels();

  function handleChannelAdd() {
    addChannel(
      coordinationScopesRaw,
      layerScope,
    );
  }

  const classes = useStyles();
  const controllerSectionClasses = useControllerSectionStyles();
  return (
    <Grid item className={classes.imageLayerControllerGridContainer}>
      <Paper className={controllerSectionClasses.layerControllerRoot}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid item xs={1}>
            <Button
              onClick={(e) => {
                // Needed to prevent affecting the expansion panel from changing
                e.stopPropagation();
                const nextVisible = typeof visible === 'boolean' ? !visible : false;
                setVisible(nextVisible);
              }}
              style={{
                marginRight: 8,
                marginBottom: 2,
                marginLeft: 8,
                marginTop: 8,
                padding: 0,
                minWidth: 0,
              }}
            >
              <Visibility />
            </Button>
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={6}>
            <Typography
              style={{
                padding: 0,
                marginBottom: 0,
                marginLeft: '4px',
                marginTop: '10px',
              }}
            >
              {label}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Slider
              value={opacity}
              min={0}
              max={1}
              step={0.001}
              onChange={(e, v) => setOpacity(v)}
              style={{ marginTop: '7px' }}
              orientation="horizontal"
            />
          </Grid>
          <Grid item xs={1}>
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
            />
          </Grid>
          <Grid item xs={1} container direction="row">
            <ImageIcon style={{ marginTop: '8px', width: '50%' }} />
            {photometricInterpretation !== 'RGB' ? (
              <Button
                onClick={(e) => {
                  // Needed to prevent affecting the expansion panel from changing
                  e.stopPropagation();
                  setOpen(prev => !prev);
                }}
                style={{
                  display: 'inline-block',
                  margin: 0,
                  padding: 0,
                  minWidth: 0,
                  lineHeight: 1,
                  width: '50%',
                }}
              >
                {open ? <ExpandLess /> : <ExpandMore />}
              </Button>
            ) : null}
          </Grid>
        </Grid>
        {photometricInterpretation !== 'RGB' && open ? (
          <Grid container direction="column" justifyContent="space-between" className={classes.imageChannelControllerGrid}>
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

              return (
                <SplitImageChannelController
                  key={cScope}
                  coordinationScopesRaw={coordinationScopesRaw}
                  layerScope={layerScope}
                  channelScope={cScope}
                  targetT={targetT}
                  targetZ={targetZ}
                  targetC={spatialTargetC}
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
            >
              Add Channel
            </Button>
          </Grid>
        ) : null}
      </Paper>
    </Grid>
  );
}
