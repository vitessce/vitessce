import React from 'react';
import { useId } from 'react-aria';
import { isEqual } from 'lodash-es';
import { TableCell, TableRow, Slider } from '@material-ui/core';
import { capitalize } from '@vitessce/utils';
import {
  usePlotOptionsStyles, OptionSelect, OptionsContainer,
} from '@vitessce/vit-s';

export default function VolcanoPlotOptions(props) {
  const {
    children,
    obsType,
    featureType,

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
  const classes = usePlotOptionsStyles();

  function handlePointSignificanceChange(event, value) {
    setFeaturePointSignificanceThreshold(value);
  }

  function handlePointFoldChangeChange(event, value) {
    setFeaturePointFoldChangeThreshold(value);
  }

  function handleLabelSignificanceChange(event, value) {
    setFeatureLabelSignificanceThreshold(value);
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
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            value={featureLabelSignificanceThreshold}
            onChange={handleLabelSignificanceChange}
            aria-label="Volcano plot label significance threshold slider"
            id={`volcano-label-significance-${volcanoOptionsId}`}
            valueLabelDisplay="auto"
            step={0.00001}
            min={0.00}
            max={0.10}
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
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
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
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            value={featurePointSignificanceThreshold}
            onChange={handlePointSignificanceChange}
            aria-label="Volcano plot point significance threshold slider"
            id={`volcano-point-significance-${volcanoOptionsId}`}
            valueLabelDisplay="auto"
            step={0.00001}
            min={0.00}
            max={0.10}
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
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
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
