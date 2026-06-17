import React from 'react';
import { Matrix4 } from 'math.gl';
import {
  Grid,
  Typography,
  Button,
  makeStyles,
  FormControl,
  NativeSelect,
  InputLabel,
  Slider,
} from '@vitessce/styles';
import { viv } from '@vitessce/gl';
import { abbreviateNumber, getBoundingCube } from '@vitessce/spatial-utils';
import { useSelectStyles } from './styles.js';

const useSlicerStyles = makeStyles()(theme => ({
  enabled: {},
  disabled: {
    color: theme.palette.text.disabled,
    // Because of the .5 opacity of the disabled color in the theme, and the fact
    // that there are multiple overlaid parts to the slider,
    // this needs to be set manually for the desired effect.
    '& .MuiSlider-thumb': {
      color: 'rgb(100, 100, 100, 1.0)',
    },
    '&  .MuiSlider-track': {
      color: 'rgb(100, 100, 100, 1.0)',
    },
  },
}));

const Slicer = ({
  xSlice,
  ySlice,
  zSlice,
  handleSlicerSetting,
  loader,
  use3d,
}) => {
  const [xSliceInit, ySliceInit, zSliceInit] = getBoundingCube(loader.data);
  const sliceValuesAndSetSliceFunctions = [
    [
      xSlice,
      xSliceNew => handleSlicerSetting('x', xSliceNew),
      'x',
      xSliceInit,
    ],
    [
      ySlice,
      ySliceNew => handleSlicerSetting('y', ySliceNew),
      'y',
      ySliceInit,
    ],
    [
      zSlice,
      zSliceNew => handleSlicerSetting('z', zSliceNew),
      'z',
      zSliceInit,
    ],
  ];

  const { classes } = useSlicerStyles();
  const Slicers = sliceValuesAndSetSliceFunctions.map(
    ([val, setVal, label, [min, max]]) => (
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        key={label}
      >
        <Grid size={1}>
          <Typography
            className={!use3d ? classes.disabled : classes.enabled}
            style={{ marginBottom: 0 }}
          >
            {label}:
          </Typography>
        </Grid>
        <Grid size={11}>
          <Slider
            disabled={!use3d}
            className={!use3d ? classes.disabled : classes.enabled}
            value={val}
            onChange={(e, v) => setVal(v)}
            valueLabelDisplay="auto"
            valueLabelFormat={v => abbreviateNumber(v)}
            getAriaLabel={index => `Clipping plane ${label} slider ${index === 0 ? 'min' : 'max'}`}
            min={min}
            max={max}
            step={0.005}
            orientation="horizontal"
          />
        </Grid>
      </Grid>
    ),
  );
  return (
    <>
      <Typography
        className={!use3d ? classes.disabled : classes.enabled}
        style={{ marginTop: 16, marginBottom: 0 }}
      >
        Clipping Planes:{' '}
      </Typography>{' '}
      {Slicers}
    </>
  );
};

const renderingOptions = Object.values(viv.RENDERING_MODES);

function RenderingModeSelect({
  handleRenderingModeChange,
  renderingMode,
  use3d,
}) {
  const { classes } = useSelectStyles();
  // Empty option allows for displaying the title of the dropdown fully in the UI.
  const options = !use3d ? [...renderingOptions, ''] : renderingOptions;
  return (
    <FormControl fullWidth>
      <InputLabel htmlFor="rendering-mode-select" variant="standard">Rendering Mode</InputLabel>
      <NativeSelect
        onChange={e => handleRenderingModeChange(e.target.value)}
        value={use3d ? renderingMode : ''}
        inputProps={{
          name: 'rendering-mode',
          id: 'rendering-mode-select',
          'aria-label': 'Select rendering mode option',
        }}
        disabled={!use3d}
        classes={{ root: classes.selectRoot }}
      >
        {options.map(name => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </NativeSelect>
    </FormControl>
  );
}

const ReCenterButton = ({
  setViewState,
  use3d,
  spatialHeight,
  spatialWidth,
  loader,
  modelMatrix,
}) => (
  <Grid size="auto" key="recenter">
    <Button
      onClick={() => {
        const defaultViewState = viv.getDefaultInitialViewState(
          loader.data,
          { height: spatialHeight, width: spatialWidth },
          1.5,
          use3d,
          new Matrix4(modelMatrix),
        );
        setViewState({
          ...defaultViewState,
          rotationX: 0,
          rotationOrbit: 0,
        });
      }
        }
      disabled={!use3d}
      style={{
        padding: 0,
        marginBottom: 6,
      }}
    >
      Re-Center
    </Button>
  </Grid>
);

const VolumeOptions = ({
  handleSlicerSetting,
  handleRenderingModeChange,
  renderingMode,
  xSlice,
  ySlice,
  zSlice,
  use3d,
  loader,
  setViewState,
  spatialHeight,
  spatialWidth,
  modelMatrix,
}) => (
  <>
    <RenderingModeSelect
      handleRenderingModeChange={handleRenderingModeChange}
      renderingMode={renderingMode}
      use3d={use3d}
    />
    <Slicer
      xSlice={xSlice}
      ySlice={ySlice}
      zSlice={zSlice}
      handleSlicerSetting={handleSlicerSetting}
      use3d={use3d}
      loader={loader}
    />
    <ReCenterButton
      setViewState={setViewState}
      use3d={use3d}
      spatialHeight={spatialHeight}
      spatialWidth={spatialWidth}
      loader={loader}
      modelMatrix={modelMatrix}
    />
  </>
);

export default VolumeOptions;
