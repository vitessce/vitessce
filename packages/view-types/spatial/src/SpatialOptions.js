import React, { useCallback } from 'react';
import { useId } from 'react-aria';
import { debounce } from 'lodash-es';
import {
  Checkbox,
  TableCell,
  TableRow,
  Slider,
  makeStyles,
} from '@vitessce/styles';
import {
  usePlotOptionsStyles, OptionsContainer, CellColorEncodingOption, OptionSelect,
} from '@vitessce/vit-s';
import { GLSL_COLORMAPS } from '@vitessce/gl';

const useToggleStyles = makeStyles()(() => ({
  cameraLabel: {
    padding: '0px 0px 0px 16px',
  },
  toggleBox: {
    padding: '0px',
  },
}));

const ToggleFixedAxisButton = ({
  setSpatialAxisFixed,
  spatialAxisFixed,
  use3d,
}) => {
  const toggleAxisId = useId();
  const { classes } = useToggleStyles();
  return (
    <TableRow>
      <TableCell className={classes.cameraLabel} variant="head" scope="row">
        <label
          htmlFor={`spatial-camera-axis-${toggleAxisId}`}
        >
          Fix Camera Axis
        </label>
      </TableCell>
      <TableCell className={classes.toggleBox} variant="body">
        <Checkbox
          onClick={() => setSpatialAxisFixed(!spatialAxisFixed)}
          disabled={!use3d}
          checked={Boolean(spatialAxisFixed)}
          slotProps={{ input: {
            'aria-label': 'Fix or not fix spatial camera axis',
            id: `spatial-camera-axis-${toggleAxisId}`,
          } }}
        />
      </TableCell>
    </TableRow>
  );
};

export default function SpatialOptions(props) {
  const {
    observationsLabel,
    cellColorEncoding,
    setCellColorEncoding,
    setSpatialAxisFixed,
    spatialAxisFixed,
    use3d,
    tooltipsVisible,
    setTooltipsVisible,
    geneExpressionColormap,
    setGeneExpressionColormap,
    geneExpressionColormapRange,
    setGeneExpressionColormapRange,
    canShowExpressionOptions,
    canShowColorEncodingOption,
    canShow3DOptions,
  } = props;

  const spatialOptionsId = useId();

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

  function handleTooltipsVisibilityChange(event) {
    setTooltipsVisible(event.target.checked);
  }

  const { classes } = usePlotOptionsStyles();

  return (
    <OptionsContainer>
      {canShowColorEncodingOption ? (
        <CellColorEncodingOption
          observationsLabel={observationsLabel}
          cellColorEncoding={cellColorEncoding}
          setCellColorEncoding={setCellColorEncoding}
        />
      ) : null}
      {canShow3DOptions ? (
        <ToggleFixedAxisButton
          setSpatialAxisFixed={setSpatialAxisFixed}
          spatialAxisFixed={spatialAxisFixed}
          use3d={use3d}
        />
      ) : null}
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`gene-expression-colormap-option-tooltip-visibility-${spatialOptionsId}`}
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
            name="gene-expression-colormap-option-tooltip-visibility"
            color="default"
            slotProps={{ input: {
              'aria-label': 'Enable or disable tooltips',
              id: `gene-expression-colormap-option-tooltip-visibility-${spatialOptionsId}`,
            } }}
          />
        </TableCell>
      </TableRow>
      {canShowExpressionOptions ? (
        <>
          <TableRow>
            <TableCell className={classes.labelCell} variant="head" scope="row">
              <label
                htmlFor={`gene-expression-colormap-select-${spatialOptionsId}`}
              >
                Gene Expression Colormap
              </label>
            </TableCell>
            <TableCell className={classes.inputCell} variant="body">
              <OptionSelect
                key="gene-expression-colormap-select"
                className={classes.select}
                value={geneExpressionColormap}
                onChange={handleGeneExpressionColormapChange}
                inputProps={{
                  id: `gene-expression-colormap-select-${spatialOptionsId}`,
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
                htmlFor={`gene-expression-colormap-range-${spatialOptionsId}`}
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
                  return `${labelPrefix} for spatial gene expression colormap range`;
                }}
                id={`gene-expression-colormap-range-${spatialOptionsId}`}
                valueLabelDisplay="auto"
                step={0.005}
                min={0.0}
                max={1.0}
              />
            </TableCell>
          </TableRow>
        </>
      ) : null}
    </OptionsContainer>
  );
}
