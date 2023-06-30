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
      <TableRow key="scatterplot-set-labels-visible">
        <TableCell className={classes.labelCell} variant="head" scope="row">
          {observationsLabelNice} Set Labels Visible
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Checkbox
            className={classes.checkbox}
            checked={cellSetLabelsVisible}
            onChange={handleLabelVisibilityChange}
            name="scatterplot-option-cell-set-labels"
            color="default"
            inputProps={{
              'aria-label': 'Checkbox for showing/hiding set labels.',
              id: 'scatterplot-set-labels-visible',
            }}
          />
        </TableCell>
      </TableRow>
      <TableRow key="scatterplot-set-tooltip-visible">
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
            name="scatterplot-option-toltip-visibility"
            color="default"
            inputProps={{
              'aria-label': 'Checkbox for showing/hiding tooltips.',
              id: 'scatterplot-set-tooltips-visible',
            }}
          />
        </TableCell>
      </TableRow>
      { cellSetLabelsVisible && (
        <TableRow key="scatterplot-set-label-size">
          <TableCell className={classes.labelCell} variant="head" scope="row">
            {observationsLabelNice} Set Label Size
          </TableCell>
          <TableCell className={classes.inputCell} variant="body">
            <Slider
              classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
              value={cellSetLabelSize}
              onChange={handleLabelSizeChange}
              aria-labelledby="scatterplot-set-label-size"
              valueLabelDisplay="auto"
              step={1}
              min={8}
              max={36}
            />
          </TableCell>
        </TableRow>
      )}
      <TableRow key="scatterplot-set-polygons-visible">
        <TableCell className={classes.labelCell} variant="head" scope="row">
          {observationsLabelNice} Set Polygons Visible
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Checkbox
            className={classes.checkbox}
            checked={cellSetPolygonsVisible}
            onChange={handlePolygonVisibilityChange}
            name="scatterplot-option-cell-set-polygons"
            color="default"
            inputProps={{
              'aria-label': 'Checkbox for showing/hiding polygons.',
              id: 'scatterplot-set-polygons-visible',
            }}
          />
        </TableCell>
      </TableRow>
      <TableRow key="scatterplot-set-radius-mode">
        <TableCell className={classes.labelCell} variant="head" scope="row">
          {observationsLabelNice} Radius Mode
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            key="scatterplot-set-radius-mode-select"
            className={classes.select}
            value={cellRadiusMode}
            onChange={handleCellRadiusModeChange}
            inputProps={{
              id: 'set-radius-mode-select',
            }}
          >
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </OptionSelect>
        </TableCell>
      </TableRow>
      { cellRadiusMode === 'manual' && (
        <TableRow key="scatterplot-set-radius-size">
          <TableCell className={classes.labelCell} variant="head" scope="row">
            {observationsLabelNice} Radius Size
          </TableCell>
          <TableCell className={classes.inputCell} variant="body">
            <Slider
              classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
              value={cellRadius}
              onChange={handleRadiusChange}
              aria-labelledby="scatterplot-set-radius-size"
              valueLabelDisplay="auto"
              step={0.01}
              min={0.01}
              max={10}
            />
          </TableCell>
        </TableRow>
      )}
      <TableRow key="scatterplot-set-opacity-mode">
        <TableCell className={classes.labelCell} variant="head" scope="row">
          {observationsLabelNice} Opacity Mode
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            key="scatterplot-set-opacity-mode-select"
            className={classes.select}
            value={cellOpacityMode}
            onChange={handleCellOpacityModeChange}
            inputProps={{
              id: 'scatterplot-set-opacity-mode',
            }}
          >
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </OptionSelect>
        </TableCell>
      </TableRow>
      { cellOpacityMode === 'manual' && (
        <TableRow key="scatterplot-set-opacity-level">
          <TableCell className={classes.labelCell} variant="head" scope="row">
            {observationsLabelNice} Opacity Level
          </TableCell>
          <TableCell className={classes.inputCell} variant="body">
            <Slider
              classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
              value={cellOpacity}
              onChange={handleOpacityChange}
              aria-labelledby="scatterplot-set-opacity-level"
              valueLabelDisplay="auto"
              step={0.05}
              min={0.0}
              max={1.0}
            />
          </TableCell>
        </TableRow>
      )}
      <TableRow key="scatterplot-gene-expression-colormap">
        <TableCell className={classes.labelCell} variant="head" scope="row">
          Gene Expression Colormap
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            key="scatterplot-gene-expression-colormap-select"
            className={classes.select}
            value={geneExpressionColormap}
            onChange={handleGeneExpressionColormapChange}
            inputProps={{
              id: 'scatterplot-gene-expression-colormap',
            }}
          >
            {GLSL_COLORMAPS.map(cmap => (
              <option key={cmap} value={cmap}>{cmap}</option>
            ))}
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow key="scatterplot-gene-expression-colormap-range">
        <TableCell className={classes.labelCell} variant="head" scope="row">
          Gene Expression Colormap Range
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            value={geneExpressionColormapRange}
            onChange={handleColormapRangeChangeDebounced}
            aria-labelledby="scatterplot-gene-expression-colormap-range"
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
