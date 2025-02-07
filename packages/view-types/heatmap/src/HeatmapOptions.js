import React, { useCallback } from 'react';
import { useId } from 'react-aria';
import { debounce } from 'lodash-es';
import { TableRow } from '@mui/material';
import { OptionsContainer, StyledOptionSelect, LabelCell, InputCell, Checkbox, Slider } from '@vitessce/vit-s';
import { GLSL_COLORMAPS } from '@vitessce/gl';

export default function HeatmapOptions(props) {
  const {
    geneExpressionColormap,
    setGeneExpressionColormap,
    geneExpressionColormapRange,
    setGeneExpressionColormapRange,
    tooltipsVisible,
    setTooltipsVisible,
  } = props;

  const heatmapOptionsId = useId();

  function handleGeneExpressionColormapChange(event) {
    setGeneExpressionColormap(event.target.value);
  }

  function handleTooltipsVisibilityChange(event) {
    setTooltipsVisible(event.target.checked);
  }

  const handleColormapRangeChange = useCallback((event, value) => {
    setGeneExpressionColormapRange(value);
  }, [setGeneExpressionColormapRange]);

  const handleColormapRangeChangeDebounced = useCallback(
    debounce(handleColormapRangeChange, 5, { trailing: true }),
    [handleColormapRangeChange],
  );

  return (
    <OptionsContainer>
      <TableRow>
        <LabelCell variant="head" scope="row">
          <label htmlFor={`heatmap-gene-expression-colormap-${heatmapOptionsId}`}>Gene Expression Colormap</label>
        </LabelCell>
        <InputCell variant="body">
          <StyledOptionSelect
            value={geneExpressionColormap}
            onChange={handleGeneExpressionColormapChange}
            inputProps={{
              'aria-label': 'Select gene expression colormap',
              id: `heatmap-gene-expression-colormap-${heatmapOptionsId}`,
            }}
          >
            {GLSL_COLORMAPS.map(cmap => (
              <option key={cmap} value={cmap}>{cmap}</option>
            ))}
          </StyledOptionSelect>
        </InputCell>
      </TableRow>
      <TableRow>
        <LabelCell variant="head" scope="row">
          <label
            htmlFor={`heatmap-gene-expression-colormap-tooltip-visibility-${heatmapOptionsId}`}
          >
            Tooltips Visible
          </label>
        </LabelCell>
        <InputCell variant="body">
          <Checkbox
            /**
             * We have to use "checked" here, not "value".
             * The checkbox state is not persisting with value.
             * For reference, https://v4.mui.com/api/checkbox/
             */
            checked={tooltipsVisible}
            onChange={handleTooltipsVisibilityChange}
            name="heatmap-gene-expression-colormap-tooltip-visibility"
            color="default"
            inputProps={{
              'aria-label': 'Show or hide tooltips',
              id: `heatmap-gene-expression-colormap-tooltip-visibility-${heatmapOptionsId}`,
            }}
          />
        </InputCell>
      </TableRow>
      <TableRow>
        <LabelCell variant="head" scope="row">
          <label
            htmlFor={`heatmap-gene-expression-colormap-range-${heatmapOptionsId}`}
          >
            Gene Expression Colormap Range
          </label>
        </LabelCell>
        <InputCell variant="body">
          <StyledSlider
            components={{
              ValueLabel: StyledSliderValueLabel,
            }}
            value={geneExpressionColormapRange}
            onChange={handleColormapRangeChangeDebounced}
            getAriaLabel={index => (index === 0 ? 'Low value colormap range slider' : 'High value colormap range slider')}
            id={`heatmap-gene-expression-colormap-range-${heatmapOptionsId}`}
            valueLabelDisplay="auto"
            step={0.005}
            min={0.0}
            max={1.0}
          />
        </InputCell>
      </TableRow>
    </OptionsContainer>
  );
}
