import React, { useCallback } from 'react';
import { debounce } from 'lodash-es';
import { Checkbox, Slider, TableCell, TableRow } from '@material-ui/core';
import { capitalize } from '@vitessce/utils';
import {
  usePlotOptionsStyles, CellColorEncodingOption, OptionsContainer, OptionSelect,
} from '@vitessce/vit-s';
import { GLSL_COLORMAPS } from '@vitessce/gl';

export default function ScatterplotOptions(props) {
  const {
    children,
    observationsLabel,
    cellRadius,
    setCellRadius,
    cellRadiusMode,
    setCellRadiusMode,
    cellOpacity,
    setCellOpacity,
    cellOpacityMode,
    setCellOpacityMode,
    cellSetLabelsVisible,
    setCellSetLabelsVisible,
    tooltipsVisible,
    setTooltipsVisible,
    cellSetLabelSize,
    setCellSetLabelSize,
    cellSetPolygonsVisible,
    setCellSetPolygonsVisible,
    cellColorEncoding,
    setCellColorEncoding,
    geneExpressionColormap,
    setGeneExpressionColormap,
    geneExpressionColormapRange,
    setGeneExpressionColormapRange,
  } = props;

  const observationsLabelNice = capitalize(observationsLabel);

  const classes = usePlotOptionsStyles();

  function handleCellRadiusModeChange(event) {
    setCellRadiusMode(event.target.value);
  }

  function handleCellOpacityModeChange(event) {
    setCellOpacityMode(event.target.value);
  }

  function handleRadiusChange(event, value) {
    setCellRadius(value);
  }

  function handleOpacityChange(event, value) {
    setCellOpacity(value);
  }

  function handleLabelVisibilityChange(event) {
    setCellSetLabelsVisible(event.target.checked);
  }

  function handleTooltipsVisibilityChange(event) {
    setTooltipsVisible(event.target.checked);
  }

  function handleLabelSizeChange(event, value) {
    setCellSetLabelSize(value);
  }

  function handlePolygonVisibilityChange(event) {
    setCellSetPolygonsVisible(event.target.checked);
  }

  function handleGeneExpressionColormapChange(event) {
    setGeneExpressionColormap(event.target.value);
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
      {children}
      <CellColorEncodingOption
        observationsLabel={observationsLabel}
        cellColorEncoding={cellColorEncoding}
        setCellColorEncoding={setCellColorEncoding}
      />
      <TableRow>
        <TableCell className={classes.plotOptionsLabelCell}>
          {observationsLabelNice} Set Labels Visible
        </TableCell>
        <TableCell className={classes.plotOptionsInputCell}>
          <Checkbox
            className={classes.plotOptionsCheckbox}
            checked={cellSetLabelsVisible}
            onChange={handleLabelVisibilityChange}
            name="scatterplot-option-cell-set-labels"
            color="default"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.plotOptionsLabelCell}>
          Tooltips Visible
        </TableCell>
        <TableCell className={classes.plotOptionsInputCell}>
          <Checkbox
            className={classes.plotOptionsCheckbox}
              /**
               * We have to use "checked" here, not "value".
               * The checkbox state is not persisting with value.
               * For reference, https://v4.mui.com/api/checkbox/
               */
            checked={tooltipsVisible}
            onChange={handleTooltipsVisibilityChange}
            name="scatterplot-option-toltip-visibility"
            color="default"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.plotOptionsLabelCell}>
          {observationsLabelNice} Set Label Size
        </TableCell>
        <TableCell className={classes.plotOptionsInputCell}>
          <Slider
            disabled={!cellSetLabelsVisible}
            classes={{ root: classes.plotOptionsSlider, valueLabel: classes.plotOptionsSliderValueLabel }}
            value={cellSetLabelSize}
            onChange={handleLabelSizeChange}
            aria-labelledby="cell-set-label-size-slider"
            valueLabelDisplay="auto"
            step={1}
            min={8}
            max={36}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.plotOptionsLabelCell}>
          {observationsLabelNice} Set Polygons Visible
        </TableCell>
        <TableCell className={classes.plotOptionsInputCell}>
          <Checkbox
            className={classes.plotOptionsCheckbox}
            checked={cellSetPolygonsVisible}
            onChange={handlePolygonVisibilityChange}
            name="scatterplot-option-cell-set-polygons"
            color="default"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.plotOptionsLabelCell} htmlFor="cell-radius-mode-select">
          {observationsLabelNice} Radius Mode
        </TableCell>
        <TableCell className={classes.plotOptionsInputCell}>
          <OptionSelect
            className={classes.plotOptionsSelect}
            value={cellRadiusMode}
            onChange={handleCellRadiusModeChange}
            inputProps={{
              id: 'cell-radius-mode-select',
            }}
          >
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.plotOptionsLabelCell}>
          {observationsLabelNice} Radius
        </TableCell>
        <TableCell className={classes.plotOptionsInputCell}>
          <Slider
            disabled={cellRadiusMode !== 'manual'}
            classes={{ root: classes.plotOptionsSlider, valueLabel: classes.plotOptionsSliderValueLabel }}
            value={cellRadius}
            onChange={handleRadiusChange}
            aria-labelledby="cell-radius-slider"
            valueLabelDisplay="auto"
            step={0.01}
            min={0.01}
            max={10}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.plotOptionsLabelCell} htmlFor="cell-opacity-mode-select">
          {observationsLabelNice} Opacity Mode
        </TableCell>
        <TableCell className={classes.plotOptionsInputCell}>
          <OptionSelect
            className={classes.plotOptionsSelect}
            value={cellOpacityMode}
            onChange={handleCellOpacityModeChange}
            inputProps={{
              id: 'cell-opacity-mode-select',
            }}
          >
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.plotOptionsLabelCell}>
          {observationsLabelNice} Opacity
        </TableCell>
        <TableCell className={classes.plotOptionsInputCell}>
          <Slider
            disabled={cellOpacityMode !== 'manual'}
            classes={{ root: classes.plotOptionsSlider, valueLabel: classes.plotOptionsSliderValueLabel }}
            value={cellOpacity}
            onChange={handleOpacityChange}
            aria-labelledby="cell-opacity-slider"
            valueLabelDisplay="auto"
            step={0.05}
            min={0.0}
            max={1.0}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.plotOptionsLabelCell} htmlFor="gene-expression-colormap-select">
          Gene Expression Colormap
        </TableCell>
        <TableCell className={classes.plotOptionsInputCell}>
          <OptionSelect
            className={classes.plotOptionsSelect}
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
        <TableCell className={classes.plotOptionsLabelCell}>
          Gene Expression Colormap Range
        </TableCell>
        <TableCell className={classes.plotOptionsInputCell}>
          <Slider
            classes={{ root: classes.plotOptionsSlider, valueLabel: classes.plotOptionsSliderValueLabel }}
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
