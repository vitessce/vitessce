/* eslint-disable */
import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/core/Slider';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Select from '@material-ui/core/Select';
import { capitalize } from '../../utils';
import { useStyles } from '../shared-plot-options/styles';
import OptionsContainer from '../shared-plot-options/OptionsContainer';
import CellColorEncodingOption from '../shared-plot-options/CellColorEncodingOption';
import { GLSL_COLORMAPS } from '../../layers/constants';

export default function ScatterplotOptions(props) {
  const {
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
    cellSetLabelSize,
    setCellSetLabelSize,
    cellSetPolygonsVisible,
    setCellSetPolygonsVisible,
    cellColorEncoding,
    setCellColorEncoding,
    geneExpressionColormap,
    setGeneExpressionColormap,
  } = props;

  const observationsLabelNice = capitalize(observationsLabel);

  const classes = useStyles();

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

  function handleLabelSizeChange(event, value) {
    setCellSetLabelSize(value);
  }

  function handlePolygonVisibilityChange(event) {
    setCellSetPolygonsVisible(event.target.checked);
  }

  function handleGeneExpressionColormapChange(event) {
    setGeneExpressionColormap(event.target.value);
  }

  return (
    <OptionsContainer>
      <CellColorEncodingOption
        observationsLabel={observationsLabel}
        cellColorEncoding={cellColorEncoding}
        setCellColorEncoding={setCellColorEncoding}
      />
      <TableRow>
        <TableCell className={classes.labelCell}>
          {observationsLabelNice} Set Labels Visible
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={cellSetLabelsVisible}
            onChange={handleLabelVisibilityChange}
            name="scatterplot-option-cell-set-labels"
            color="default"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          {observationsLabelNice} Set Label Size
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Slider
            disabled={!cellSetLabelsVisible}
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
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
        <TableCell className={classes.labelCell}>
          {observationsLabelNice} Set Polygons Visible
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={cellSetPolygonsVisible}
            onChange={handlePolygonVisibilityChange}
            name="scatterplot-option-cell-set-polygons"
            color="default"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} htmlFor="cell-radius-mode-select">
          {observationsLabelNice} Radius Mode
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Select
            native
            className={classes.select}
            value={cellRadiusMode}
            onChange={handleCellRadiusModeChange}
            inputProps={{
              id: 'cell-radius-mode-select',
            }}
          >
            <option value="static">Static</option>
            <option value="dynamic">Dynamic</option>
          </Select>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          {observationsLabelNice} Radius
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Slider
            disabled={cellRadiusMode !== "static"}
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
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
        <TableCell className={classes.labelCell} htmlFor="cell-opacity-mode-select">
          {observationsLabelNice} Opacity Mode
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Select
            native
            className={classes.select}
            value={cellOpacityMode}
            onChange={handleCellOpacityModeChange}
            inputProps={{
              id: 'cell-opacity-mode-select',
            }}
          >
            <option value="static">Static</option>
            <option value="dynamic">Dynamic</option>
            <option value="cellSetSelection">Cell Set Encoding</option>
          </Select>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell}>
          {observationsLabelNice} Opacity
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Slider
            disabled={cellOpacityMode !== "static"}
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
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
        <TableCell className={classes.labelCell} htmlFor="gene-expression-colormap-select">
          Gene Expression Colormap
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Select
            native
            className={classes.select}
            value={geneExpressionColormap}
            onChange={handleGeneExpressionColormapChange}
            inputProps={{
              id: 'gene-expression-colormap-select',
            }}
          >
            {GLSL_COLORMAPS.map((cmap) => (
              <option key={cmap} value={cmap}>{cmap}</option>
            ))}
          </Select>
        </TableCell>
      </TableRow>
    </OptionsContainer>
  );
}
