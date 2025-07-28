import React from 'react';
import { useId } from 'react-aria';
import { TableCell, TableRow, Slider } from '@vitessce/styles';
import {
  usePlotOptionsStyles, OptionsContainer,
} from '@vitessce/vit-s';

export default function VolcanoPlotOptions(props) {
  const {
    children,

    featurePointSignificanceThreshold,
    featurePointFoldChangeThreshold,
    featureLabelSignificanceThreshold,
    featureLabelFoldChangeThreshold,

    setFeaturePointSignificanceThreshold,
    setFeaturePointFoldChangeThreshold,
    setFeatureLabelSignificanceThreshold,
    setFeatureLabelFoldChangeThreshold,
  } = props;

  const volcanoOptionsId = useId();
  const { classes } = usePlotOptionsStyles();

  function handlePointSignificanceChange(event, value) {
    setFeaturePointSignificanceThreshold(10 ** -value);
  }

  function handlePointFoldChangeChange(event, value) {
    setFeaturePointFoldChangeThreshold(value);
  }

  function handleLabelSignificanceChange(event, value) {
    setFeatureLabelSignificanceThreshold(10 ** -value);
  }

  function handleLabelFoldChangeChange(event, value) {
    setFeatureLabelFoldChangeThreshold(value);
  }


  return (
    <OptionsContainer>
      {children}
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`volcano-label-significance-${volcanoOptionsId}`}
          >
            Label Significance Threshold
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            slotProps={{
              root: { className: classes.slider },
              valueLabel: { className: classes.sliderValueLabel },
            }}
            value={-Math.log10(featureLabelSignificanceThreshold)}
            onChange={handleLabelSignificanceChange}
            aria-label="Volcano plot label significance threshold slider"
            id={`volcano-label-significance-${volcanoOptionsId}`}
            valueLabelDisplay="auto"
            step={1}
            min={0}
            max={100}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`volcano-label-fc-${volcanoOptionsId}`}
          >
            Label Fold-Change Threshold
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            slotProps={{
              root: { className: classes.slider },
              valueLabel: { className: classes.sliderValueLabel },
            }}
            value={featureLabelFoldChangeThreshold}
            onChange={handleLabelFoldChangeChange}
            aria-label="Volcano plot label fold-change threshold slider"
            id={`volcano-label-fc-${volcanoOptionsId}`}
            valueLabelDisplay="auto"
            step={0.5}
            min={0}
            max={50}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`volcano-point-significance-${volcanoOptionsId}`}
          >
            Point Significance Threshold
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            slotProps={{
              root: { className: classes.slider },
              valueLabel: { className: classes.sliderValueLabel },
            }}
            value={-Math.log10(featurePointSignificanceThreshold)}
            onChange={handlePointSignificanceChange}
            aria-label="Volcano plot point significance threshold slider"
            id={`volcano-point-significance-${volcanoOptionsId}`}
            valueLabelDisplay="auto"
            step={1}
            min={0}
            max={100}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`volcano-point-fc-${volcanoOptionsId}`}
          >
            Point Fold-Change Threshold
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            slotProps={{
              root: { className: classes.slider },
              valueLabel: { className: classes.sliderValueLabel },
            }}
            value={featurePointFoldChangeThreshold}
            onChange={handlePointFoldChangeChange}
            aria-label="Volcano plot point fold-change threshold slider"
            id={`volcano-point-fc-${volcanoOptionsId}`}
            valueLabelDisplay="auto"
            step={0.5}
            min={0}
            max={50}
          />
        </TableCell>
      </TableRow>
    </OptionsContainer>
  );
}
