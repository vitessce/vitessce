import React, { useCallback } from 'react';
import { debounce } from 'lodash-es';
import { Checkbox, Slider, TableCell, TableRow } from '@material-ui/core';
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

  const classes = usePlotOptionsStyles();

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
          Gene Expression Colormap
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            className={classes.select}
            value={geneExpressionColormap}
            onChange={handleGeneExpressionColormapChange}
            inputProps={{
              'aria-label': 'Select gene expression colormap.',
              id: 'heatmap-gene-expression-colormap',
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
          Tooltips Visible
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
            name="gene-expression-colormap-option-tooltip-visibility"
            color="default"
            inputProps={{
              'aria-label': 'Checkbox for showing or hiding tooltips.',
              id: 'gene-expression-colormap-option-tooltip-visibility',
            }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          Gene Expression Colormap Range
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            value={geneExpressionColormapRange}
            onChange={handleColormapRangeChangeDebounced}
            aria-labelledby="heatmap-gene-expression-colormap-range"
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
