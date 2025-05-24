import React, { useCallback } from 'react';
import { useId } from 'react-aria';
import { debounce } from 'lodash-es';
import { Checkbox, Slider, TableCell, TableRow } from '@vitessce/styles';
import { usePlotOptionsStyles, OptionsContainer, OptionSelect } from '@vitessce/vit-s';
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

  const { classes } = usePlotOptionsStyles();
  const heatmapOptionsId = useId();

  function handleGeneExpressionColormapChange(event) {
    setGeneExpressionColormap(event.target.value);
  }

  function handleTooltipsVisibilityChange(event) {
    setTooltipsVisible(event.target.checked);
  }

  function handleColormapRangeChange(event, value) {
    setGeneExpressionColormapRange(value);
  }
  const handleColormapRangeChangeDebounced = useCallback(
    debounce(handleColormapRangeChange, 5, { trailing: true }),
    [handleColormapRangeChange],
  );

  return (
    <OptionsContainer>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label htmlFor={`heatmap-gene-expression-colormap-${heatmapOptionsId}`}>Gene Expression Colormap</label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            className={classes.select}
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
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`heatmap-gene-expression-colormap-tooltip-visibility-${heatmapOptionsId}`}
          >
            Tooltips Visible
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Checkbox
            className={classes.checkbox}
            /**
             * We have to use "checked" here, not "value".
             * The checkbox state is not persisting with value.
             * For reference, https://v4.mui.com/api/checkbox/
             */
            checked={tooltipsVisible}
            onChange={handleTooltipsVisibilityChange}
            name="heatmap-gene-expression-colormap-tooltip-visibility"
            color="default"
            slotProps={{ input: {
              'aria-label': 'Show or hide tooltips',
              id: `heatmap-gene-expression-colormap-tooltip-visibility-${heatmapOptionsId}`,
            } }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`heatmap-gene-expression-colormap-range-${heatmapOptionsId}`}
          >
            Gene Expression Colormap Range
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            slotProps={{
              root: { className: classes.slider },
              valueLabel: { className: classes.sliderValueLabel },
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
        </TableCell>
      </TableRow>
    </OptionsContainer>
  );
}
