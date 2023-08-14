import React, { useCallback } from 'react';
import { debounce } from 'lodash-es';

import {
  Checkbox,
  TableCell,
  TableRow,
  Slider,
  makeStyles,
} from '@material-ui/core';
import {
  usePlotOptionsStyles, OptionsContainer, CellColorEncodingOption, OptionSelect,
} from '@vitessce/vit-s';
import { GLSL_COLORMAPS } from '@vitessce/gl';

const useToggleStyles = makeStyles(() => ({
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
  const classes = useToggleStyles();
  return use3d && (
    <TableRow>
      <TableCell className={classes.cameraLabel} variant="head" scope="row">
        Fix Camera Axis
      </TableCell>
      <TableCell className={classes.toggleBox} variant="body">
        <Checkbox
          onClick={() => setSpatialAxisFixed(!spatialAxisFixed)}
          checked={Boolean(spatialAxisFixed)}
          inputProps={{ 'aria-label': 'Checkbox for fixing/not fixing spatial axis.' }}
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

  const classes = usePlotOptionsStyles();

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
            inputProps={{ 'aria-label': 'Enable or disable tooltips.' }}
          />
        </TableCell>
      </TableRow>
      {canShowExpressionOptions ? (
        <>
          <TableRow>
            <TableCell className={classes.labelCell} variant="head" scope="row">
              Gene Expression Colormap
            </TableCell>
            <TableCell className={classes.inputCell} variant="body">
              <OptionSelect
                key="gene-expression-colormap-select"
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
            <TableCell className={classes.labelCell} variant="head" scope="row">
              Gene Expression Colormap Range
            </TableCell>
            <TableCell className={classes.inputCell} variant="body">
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
        </>
      ) : null}
    </OptionsContainer>
  );
}
