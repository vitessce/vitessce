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
  toggleCameraLabel: {
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
  return (
    <TableRow>
      <TableCell className={classes.toggleCameraLabel}>
        Fix Camera Axis
      </TableCell>
      <TableCell className={classes.toggleBox}>
        <Checkbox
          onClick={() => setSpatialAxisFixed(!spatialAxisFixed)}
          disabled={!use3d}
          checked={Boolean(spatialAxisFixed)}
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
            name="gene-expression-colormap-option-toltip-visibility"
            color="default"
          />
        </TableCell>
      </TableRow>
      {canShowExpressionOptions ? (
        <>
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
        </>
      ) : null}
    </OptionsContainer>
  );
}
