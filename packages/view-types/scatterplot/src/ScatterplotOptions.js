import React, { useCallback, useId } from 'react';
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

  const scatterplotOptionsId = useId();

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
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={['scatterplot-set-labels-visible', scatterplotOptionsId].join('-')}
          >
            {observationsLabelNice} Set Labels Visible
          </label>
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
              id: ['scatterplot-set-labels-visible', scatterplotOptionsId].join('-'),
            }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={['scatterplot-set-tooltips-visible', scatterplotOptionsId].join('-')}
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
            name="scatterplot-option-tooltip-visibility"
            color="default"
            inputProps={{
              'aria-label': 'Checkbox for showing/hiding tooltips.',
              id: ['scatterplot-set-tooltips-visible', scatterplotOptionsId].join('-'),
            }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={['scatterplot-set-label-size', scatterplotOptionsId].join('-')}
          >
            {observationsLabelNice} Set Label Size
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            disabled={!cellSetLabelsVisible}
            value={cellSetLabelSize}
            onChange={handleLabelSizeChange}
            getAriaLabel={() => 'Scatterplot label size slider'}
            id={['scatterplot-set-label-size', scatterplotOptionsId].join('-')}
            valueLabelDisplay="auto"
            step={1}
            min={8}
            max={36}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={['scatterplot-set-polygons-visible', scatterplotOptionsId].join('-')}
          >
            {observationsLabelNice} Set Polygons Visible
          </label>
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
              id: ['scatterplot-set-polygons-visible', scatterplotOptionsId].join('-'),
            }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={['scatterplot-set-radius-mode-select', scatterplotOptionsId].join('-')}
          >
            {observationsLabelNice} Radius Mode
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            key="scatterplot-set-radius-mode-select"
            className={classes.select}
            value={cellRadiusMode}
            onChange={handleCellRadiusModeChange}
            inputProps={{
              id: ['scatterplot-set-radius-mode-select', scatterplotOptionsId].join('-'),
            }}
          >
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={['scatterplot-set-radius-size-select', scatterplotOptionsId].join('-')}
          >
            {observationsLabelNice} Radius Size
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            disabled={cellRadiusMode !== 'manual'}
            value={cellRadius}
            onChange={handleRadiusChange}
            getAriaLabel={() => 'Scatterplot radius size slider'}
            id={['scatterplot-set-radius-size-select', scatterplotOptionsId].join('-')}
            valueLabelDisplay="auto"
            step={0.01}
            min={0.01}
            max={10}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={['scatterplot-set-opacity-mode', scatterplotOptionsId].join('-')}
          >
            {observationsLabelNice} Opacity Mode
          </label>
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
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={['scatterplot-set-opacity-level', scatterplotOptionsId].join('-')}
          >
            {observationsLabelNice} Opacity Level
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            disabled={cellOpacityMode !== 'manual'}
            value={cellOpacity}
            onChange={handleOpacityChange}
            getAriaLabel={() => 'Scatterplot opacity level slider'}
            id={['scatterplot-set-opacity-level', scatterplotOptionsId].join('-')}
            valueLabelDisplay="auto"
            step={0.05}
            min={0.0}
            max={1.0}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={['scatterplot-gene-expression-colormap', scatterplotOptionsId].join('-')}
          >
            Gene Expression Colormap
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            key="scatterplot-gene-expression-colormap"
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
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={['scatterplot-gene-expression-colormap-range', scatterplotOptionsId].join('-')}
          >
            Gene Expression Colormap Range
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            value={geneExpressionColormapRange}
            onChange={handleColormapRangeChangeDebounced}
            getAriaLabel={(index) => {
              const labelPrefix = index === 0 ? 'Low value slider' : 'High value slider';
              return `${labelPrefix} for scatterplot gene expression colormap range.`;
            }}
            id={['scatterplot-gene-expression-colormap-range', scatterplotOptionsId].join('-')}
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
