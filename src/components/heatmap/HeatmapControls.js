import React from 'react';
import Box from '@material-ui/core/Box';
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  box: {
    opacity: 0.5,
    height: '80px',
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
    position: 'absolute',
    padding: '10px 0',
    transition: 'opacity 0.1s',
    '&:hover': {
      opacity: 1.0,
    },
  },
}));

export default function HeatmapControls(props) {
  const {
    colormapRange,
    setColormapRange,
  } = props;
  const classes = useStyles();

  function onColorScaleChange(event, value) {
    setColormapRange(value);
  }

  return (
    <Box component="div" m={1} className={classes.box}>
      <Slider
        orientation="vertical"
        value={colormapRange}
        onChange={onColorScaleChange}
        aria-labelledby="colorscale-slider"
        min={0.0}
        max={1.0}
        step={0.005}
      />
    </Box>
  );
}
