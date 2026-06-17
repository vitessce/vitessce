import React, { useCallback } from 'react';
import { useId } from 'react-aria';
import { debounce } from 'lodash-es';
import { Checkbox, Slider, TableCell, TableRow } from '@vitessce/styles';
import { capitalize } from '@vitessce/utils';
import {
  usePlotOptionsStyles, CellColorEncodingOption, OptionsContainer, OptionSelect,
} from '@vitessce/vit-s';
import { GLSL_COLORMAPS } from '@vitessce/gl';

const FEATURE_AGGREGATION_STRATEGIES = ['first', 'last', 'sum', 'mean'];

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

    embeddingPointsVisible,
    setEmbeddingPointsVisible,
    embeddingContoursVisible,
    setEmbeddingContoursVisible,
    embeddingContoursFilled,
    setEmbeddingContoursFilled,

    contourPercentiles,
    setContourPercentiles,
    defaultContourPercentiles,

    contourColorEncoding,
    setContourColorEncoding,

    featureAggregationStrategy,
    setFeatureAggregationStrategy,
  } = props;

  const scatterplotOptionsId = useId();

  const observationsLabelNice = capitalize(observationsLabel);

  const { classes } = usePlotOptionsStyles();

  function handleCellRadiusModeChange(event) {
    setCellRadiusMode(event.target.value);
  }

  function handleContourColorEncodingChange(event) {
    setContourColorEncoding(event.target.value);
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

  function handlePointsVisibilityChange(event) {
    setEmbeddingPointsVisible(event.target.checked);
  }

  function handleContoursVisibilityChange(event) {
    setEmbeddingContoursVisible(event.target.checked);
  }

  function handleContoursFilledChange(event) {
    setEmbeddingContoursFilled(event.target.checked);
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

  function handlePercentilesChange(event, values) {
    setContourPercentiles(values);
  }
  const handlePercentilesChangeDebounced = useCallback(
    debounce(handlePercentilesChange, 5, { trailing: true }),
    [handlePercentilesChange],
  );

  function handleFeatureAggregationStrategyChange(event) {
    setFeatureAggregationStrategy(event.target.value);
  }

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
            htmlFor={`scatterplot-set-labels-visible-${scatterplotOptionsId}`}
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
            slotProps={{ input: {
              'aria-label': 'Show or hide set labels',
              id: `scatterplot-set-labels-visible-${scatterplotOptionsId}`,
            } }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`scatterplot-set-tooltips-visible-${scatterplotOptionsId}`}
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
            slotProps={{ input: {
              'aria-label': 'Show or hide tooltips',
              id: `scatterplot-set-tooltips-visible-${scatterplotOptionsId}`,
            } }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`scatterplot-set-label-size-${scatterplotOptionsId}`}
          >
            {observationsLabelNice} Set Label Size
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            slotProps={{
              root: { className: classes.slider },
              valueLabel: { className: classes.sliderValueLabel },
            }}
            disabled={!cellSetLabelsVisible}
            value={cellSetLabelSize}
            onChange={handleLabelSizeChange}
            aria-label="Scatterplot label size slider"
            id={`scatterplot-set-label-size-${scatterplotOptionsId}`}
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
            htmlFor={`scatterplot-set-polygons-visible-${scatterplotOptionsId}`}
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
            slotProps={{ input: {
              'aria-label': 'Show or hide polygons',
              id: `scatterplot-set-polygons-visible-${scatterplotOptionsId}`,
            } }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`scatterplot-set-radius-mode-select-${scatterplotOptionsId}`}
          >
            {observationsLabelNice} Radius Mode
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            className={classes.select}
            value={cellRadiusMode}
            onChange={handleCellRadiusModeChange}
            inputProps={{
              id: `scatterplot-set-radius-mode-select-${scatterplotOptionsId}`,
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
            htmlFor={`scatterplot-set-radius-size-select-${scatterplotOptionsId}`}
          >
            {observationsLabelNice} Radius Size
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            slotProps={{
              root: { className: classes.slider },
              valueLabel: { className: classes.sliderValueLabel },
            }}
            disabled={cellRadiusMode !== 'manual'}
            value={cellRadius}
            onChange={handleRadiusChange}
            aria-label="Scatterplot radius size slider"
            id={`scatterplot-set-radius-size-select-${scatterplotOptionsId}`}
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
            htmlFor={`scatterplot-set-opacity-mode-${scatterplotOptionsId}`}
          >
            {observationsLabelNice} Opacity Mode
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            className={classes.select}
            value={cellOpacityMode}
            onChange={handleCellOpacityModeChange}
            inputProps={{
              id: `scatterplot-set-opacity-mode-${scatterplotOptionsId}`,
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
            htmlFor={`scatterplot-set-opacity-level-${scatterplotOptionsId}`}
          >
            {observationsLabelNice} Opacity Level
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            slotProps={{
              root: { className: classes.slider },
              valueLabel: { className: classes.sliderValueLabel },
            }}
            disabled={cellOpacityMode !== 'manual'}
            value={cellOpacity}
            onChange={handleOpacityChange}
            aria-label="Scatterplot opacity level slider"
            id={`scatterplot-set-opacity-level-${scatterplotOptionsId}`}
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
            htmlFor={`scatterplot-gene-expression-colormap-${scatterplotOptionsId}`}
          >
            Gene Expression Colormap
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            className={classes.select}
            value={geneExpressionColormap}
            onChange={handleGeneExpressionColormapChange}
            inputProps={{
              id: `scatterplot-gene-expression-colormap-${scatterplotOptionsId}`,
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
            htmlFor={`scatterplot-gene-expression-colormap-range-${scatterplotOptionsId}`}
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
            getAriaLabel={(index) => {
              const labelPrefix = index === 0 ? 'Low value slider' : 'High value slider';
              return `${labelPrefix} for scatterplot gene expression colormap range`;
            }}
            id={`scatterplot-gene-expression-colormap-range-${scatterplotOptionsId}`}
            valueLabelDisplay="auto"
            step={0.005}
            min={0.0}
            max={1.0}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`scatterplot-points-visible-${scatterplotOptionsId}`}
          >
            Points Visible
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Checkbox
            className={classes.checkbox}
            checked={embeddingPointsVisible}
            onChange={handlePointsVisibilityChange}
            name="scatterplot-option-point-visibility"
            color="default"
            slotProps={{ input: {
              'aria-label': 'Show or hide scatterplot points',
              id: `scatterplot-points-visible-${scatterplotOptionsId}`,
            } }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`scatterplot-contours-visible-${scatterplotOptionsId}`}
          >
            Contours Visible
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Checkbox
            className={classes.checkbox}
            checked={embeddingContoursVisible}
            onChange={handleContoursVisibilityChange}
            name="scatterplot-option-contour-visibility"
            color="default"
            slotProps={{ input: {
              'aria-label': 'Show or hide contours',
              id: `scatterplot-contours-visible-${scatterplotOptionsId}`,
            } }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`scatterplot-contours-filled-${scatterplotOptionsId}`}
          >
            Contours Filled
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Checkbox
            className={classes.checkbox}
            checked={embeddingContoursFilled}
            onChange={handleContoursFilledChange}
            name="scatterplot-option-contour-filled"
            color="default"
            slotProps={{ input: {
              'aria-label': 'Filled or stroked contours',
              id: `scatterplot-contours-filled-${scatterplotOptionsId}`,
            } }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`scatterplot-contour-color-encoding-${scatterplotOptionsId}`}
          >
            Contour Color Encoding
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            className={classes.select}
            value={contourColorEncoding}
            onChange={handleContourColorEncodingChange}
            inputProps={{
              id: `scatterplot-contour-color-encoding-${scatterplotOptionsId}`,
            }}
          >
            <option value="sampleSetSelection">Sample Sets</option>
            <option value="cellSetSelection">{observationsLabelNice} Sets</option>
            <option value="staticColor">Static Color</option>
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`scatterplot-contour-percentiles-${scatterplotOptionsId}`}
          >
            Contour Percentiles
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <Slider
            slotProps={{
              root: { className: classes.slider },
              valueLabel: { className: classes.sliderValueLabel },
            }}
            value={contourPercentiles || defaultContourPercentiles}
            onChange={handlePercentilesChangeDebounced}
            getAriaLabel={(index) => {
              if (index === 0) {
                return 'Slider for first (of three) contour percentile threshold, corresponding to lightest-opacity contours';
              }
              if (index === 1) {
                return 'Slider for second (of three) contour percentile threshold, corresponding to second-lightest-opacity contours';
              }
              if (index === 2) {
                return 'Slider for third (of three) contour percentile threshold, corresponding to most-opaque contours';
              }
              return 'Scatterplot sliders for contour percentile thresholds';
            }}
            id={`scatterplot-contour-percentiles-${scatterplotOptionsId}`}
            valueLabelDisplay="auto"
            step={0.005}
            min={0.009}
            max={0.999}
          />
        </TableCell>
      </TableRow>
      {setFeatureAggregationStrategy ? (
        <TableRow>
          <TableCell className={classes.labelCell} variant="head" scope="row">
            <label
              htmlFor={`feature-aggregation-strategy-${scatterplotOptionsId}`}
            >
              Feature Aggregation Strategy
            </label>
          </TableCell>
          <TableCell className={classes.inputCell} variant="body">
            <OptionSelect
              className={classes.select}
              value={featureAggregationStrategy ?? 'first'}
              onChange={handleFeatureAggregationStrategyChange}
              inputProps={{
                id: `feature-aggregation-strategy-${scatterplotOptionsId}`,
              }}
            >
              {FEATURE_AGGREGATION_STRATEGIES.map(opt => (
                <option key={opt} value={opt}>
                  {capitalize(opt)}
                </option>
              ))}
            </OptionSelect>
          </TableCell>
        </TableRow>
      ) : null}
    </OptionsContainer>
  );
}
