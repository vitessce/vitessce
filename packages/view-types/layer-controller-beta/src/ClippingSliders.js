import React from 'react';
import {
  Grid,
  Typography,
  Slider,
} from '@vitessce/styles';
import { abbreviateNumber } from '@vitessce/spatial-utils';

function DimensionSlider(props) {
  const {
    boundingSlice,
    sliceValue,
    setSliceValue,
    label,
  } = props;

  const [min, max] = boundingSlice;
  const val = sliceValue || boundingSlice;

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      key={label}
    >
      <Grid size={1}>
        <Typography
          style={{ marginBottom: 0 }}
        >
          {label}:
        </Typography>
      </Grid>
      <Grid size={11}>
        <Slider
          value={val}
          onChange={(e, v) => setSliceValue(v)}
          valueLabelDisplay="auto"
          valueLabelFormat={v => abbreviateNumber(v)}
          getAriaLabel={index => `${label}-axis clipping plane slider ${index === 0 ? 'min' : 'max'}`}
          min={min}
          max={max}
          step={0.005}
          orientation="horizontal"
        />
      </Grid>
    </Grid>
  );
}


export default function ClippingSliders(props) {
  const {
    image,
    spatialSliceX,
    spatialSliceY,
    spatialSliceZ,
    setSpatialSliceX,
    setSpatialSliceY,
    setSpatialSliceZ,
  } = props;

  const [xSliceInit, ySliceInit, zSliceInit] = image.getBoundingCube();

  return (
    <>
      <DimensionSlider
        label="X"
        boundingSlice={xSliceInit}
        sliceValue={spatialSliceX}
        setSliceValue={setSpatialSliceX}
      />
      <DimensionSlider
        label="Y"
        boundingSlice={ySliceInit}
        sliceValue={spatialSliceY}
        setSliceValue={setSpatialSliceY}
      />
      <DimensionSlider
        label="Z"
        boundingSlice={zSliceInit}
        sliceValue={spatialSliceZ}
        setSliceValue={setSpatialSliceZ}
      />
    </>
  );
}
