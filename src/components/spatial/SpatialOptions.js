import React, { useCallback } from 'react';
import debounce from 'lodash/debounce';

import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Slider from '@material-ui/core/Slider';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { useStyles } from '../shared-plot-options/styles';
import OptionsContainer from '../shared-plot-options/OptionsContainer';
import CellColorEncodingOption from '../shared-plot-options/CellColorEncodingOption';
import OptionSelect from '../shared-plot-options/OptionSelect';
import { GLSL_COLORMAPS } from '../../layers/constants';

const useToggleStyles = makeStyles(() => createStyles({
  cameraLabel: {
    padding: '0px 0px 0px 16px',
  },
  box: {
    padding: '0px',
  },
  button: {
    padding: '0px 0px 0px 8px',
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
      <TableCell className={classes.cameraLabel}>
      Fix Camera Axis
      </TableCell>
      <TableCell className={classes.box}>
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

  const classes = useStyles();

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
      {canShowExpressionOptions ? (
        <>
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
        </>
      ) : null}
    </OptionsContainer>
  );
}
