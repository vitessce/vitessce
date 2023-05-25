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
    tooltipDisabled,
    setTooltipDisabled,
  } = props;

  const classes = usePlotOptionsStyles();

  function handleGeneExpressionColormapChange(event) {
    setGeneExpressionColormap(event.target.value);
  }

  function handleTooltipVisibilityChange(event) {
    setTooltipDisabled(event.target.checked);
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
        <TableCell className={classes.labelCell} htmlFor="gene-expression-colormap-select">
          Gene Expression Colormap
        </TableCell>
        <TableCell className={classes.inputCell}>
          <OptionSelect
            className={classes.select}
            value={geneExpressionColormap}
            onChange={handleGeneExpressionColormapChange}
            inputProps={{
              id: 'gene-expression-colormap-select',
            }}
          >
            {GLSL_COLORMAPS.map(cmap => (
              <option key={cmap} value={cmap}>{cmap}</option>
            ))}
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          Disable Tooltip
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            value={tooltipDisabled}
            onChange={handleTooltipVisibilityChange}
            name="gene-expression-colormap-option-toltip-visibility"
            color="default"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          Gene Expression Colormap Range
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Slider
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            value={geneExpressionColormapRange}
            onChange={handleColormapRangeChangeDebounced}
            aria-labelledby="gene-expression-colormap-range-slider"
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
