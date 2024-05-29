import React from 'react';
import { useId } from 'react-aria';
import { TableCell, TableRow, TextField, Slider } from '@material-ui/core';
import { usePlotOptionsStyles, OptionsContainer, OptionSelect } from '@vitessce/vit-s';
import { GLSL_COLORMAPS } from '@vitessce/gl';

export default function CellSetExpressionPlotOptions(props) {
  const {
    featureValueTransform,
    setFeatureValueTransform,
    featureValueTransformCoefficient,
    setFeatureValueTransformCoefficient,
    transformOptions,
    featureValuePositivityThreshold,
    setFeatureValuePositivityThreshold,
    featureValueColormap,
    setFeatureValueColormap,
  } = props;

  const cellSetExpressionPlotOptionsId = useId();

  const classes = usePlotOptionsStyles();

  function handleFeatureValueColormapChange(event) {
    setFeatureValueColormap(event.target.value);
  }

  const handleTransformChange = (event) => {
    setFeatureValueTransform(event.target.value === '' ? null : event.target.value);
  };

  function handlePositivityThresholdChange(event, value) {
    setFeatureValuePositivityThreshold(value);
  }

  // Feels a little hacky, but I think this is the best way to handle
  // the limitations of the v4 material-ui number input.
  const handleTransformCoefficientChange = (event) => {
    const { value } = event.target;
    if (!value) {
      setFeatureValueTransformCoefficient(value);
    } else {
      const newCoefficient = Number(value);
      if (!Number.isNaN(newCoefficient) && newCoefficient >= 0) {
        setFeatureValueTransformCoefficient(value);
      }
    }
  };

  return (
    <OptionsContainer>
      {setFeatureValueColormap ? (
        <TableRow>
          <TableCell className={classes.labelCell} variant="head" scope="row">
            <label htmlFor={`cellset-expression-feature-value-colormap-${cellSetExpressionPlotOptionsId}`}>
              Feature Value Colormap
            </label>
          </TableCell>
          <TableCell className={classes.inputCell} variant="body">
            <OptionSelect
              className={classes.select}
              value={featureValueColormap}
              onChange={handleFeatureValueColormapChange}
              inputProps={{
                'aria-label': 'Select feature value colormap',
                id: `cellset-expression-feature-value-colormap-${cellSetExpressionPlotOptionsId}`,
              }}
            >
              {GLSL_COLORMAPS.map(cmap => (
                <option key={cmap} value={cmap}>{cmap}</option>
              ))}
            </OptionSelect>
          </TableCell>
        </TableRow>
      ) : null}
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`cellset-expression-transform-select-${cellSetExpressionPlotOptionsId}`}
          >
            Transform
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            className={classes.select}
            value={featureValueTransform === null ? '' : featureValueTransform}
            onChange={handleTransformChange}
            inputProps={{
              id: `cellset-expression-transform-select-${cellSetExpressionPlotOptionsId}`,
            }}
          >
            {transformOptions.map(opt => (
              <option key={opt.name} value={opt.value === null ? '' : opt.value}>
                {opt.name}
              </option>
            ))}
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`cellset-expression-transform-coeff-${cellSetExpressionPlotOptionsId}`}
          >
            Transform Coefficient
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <TextField
            label="Transform Coefficient"
            type="number"
            onChange={handleTransformCoefficientChange}
            value={featureValueTransformCoefficient}
            InputLabelProps={{
              shrink: true,
            }}
            id={`cellset-expression-transform-coeff-${cellSetExpressionPlotOptionsId}`}
          />
        </TableCell>
      </TableRow>
      {setFeatureValuePositivityThreshold ? (
        <TableRow key="transform-coefficient-option-row">
          <TableCell className={classes.labelCell}>
            Positivity Threshold
          </TableCell>
          <TableCell className={classes.inputCell}>
            <Slider
              classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
              value={featureValuePositivityThreshold}
              onChange={handlePositivityThresholdChange}
              aria-labelledby="pos-threshold-slider"
              valueLabelDisplay="auto"
              step={1.0}
              min={0.0}
              max={100.0}
            />
          </TableCell>
        </TableRow>
      ) : null}
    </OptionsContainer>
  );
}
