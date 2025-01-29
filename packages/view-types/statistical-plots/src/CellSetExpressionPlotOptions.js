import React from 'react';
import { useId } from 'react-aria';
import { TableCell, TableRow, TextField } from '@mui/material';
import { OptionsContainer, StyledOptionSelect, LabelCell, InputCell, Slider, SliderValueLabel } from '@vitessce/vit-s';
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
          <LabelCell variant="head" scope="row">
            <label htmlFor={`cellset-expression-feature-value-colormap-${cellSetExpressionPlotOptionsId}`}>
              Feature Value Colormap
            </label>
          </LabelCell>
          <InputCell variant="body">
            <StyledOptionSelect
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
            </StyledOptionSelect>
          </InputCell>
        </TableRow>
      ) : null}
      <TableRow>
        <LabelCell variant="head" scope="row">
          <label
            htmlFor={`cellset-expression-transform-select-${cellSetExpressionPlotOptionsId}`}
          >
            Transform
          </label>
        </LabelCell>
        <InputCell variant="body">
          <StyledOptionSelect
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
          </StyledOptionSelect>
        </InputCell>
      </TableRow>
      <TableRow>
        <LabelCell variant="head" scope="row">
          <label
            htmlFor={`cellset-expression-transform-coeff-${cellSetExpressionPlotOptionsId}`}
          >
            Transform Coefficient
          </label>
        </LabelCell>
        <LabelCell variant="body">
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
        </LabelCell>
      </TableRow>
      {setFeatureValuePositivityThreshold ? (
        <TableRow key="transform-coefficient-option-row">
          <LabelCell>
            Positivity Threshold
          </LabelCell>
          <InputCell>
            <Slider
              component={{
                ValueLabel: SliderValueLabel,
              }}
              value={featureValuePositivityThreshold}
              onChange={handlePositivityThresholdChange}
              aria-labelledby="pos-threshold-slider"
              valueLabelDisplay="auto"
              step={1.0}
              min={0.0}
              max={100.0}
            />
          </InputCell>
        </TableRow>
      ) : null}
    </OptionsContainer>
  );
}
