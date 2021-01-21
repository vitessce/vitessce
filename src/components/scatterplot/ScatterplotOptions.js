import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/core/Slider';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { capitalize } from '../../utils';
import { useStyles } from '../shared-plot-options/styles';
import OptionsContainer from '../shared-plot-options/OptionsContainer';
import CellColorEncodingOption from '../shared-plot-options/CellColorEncodingOption';

export default function ScatterplotOptions(props) {
  const {
    observationsLabel,
    cellRadius,
    setCellRadius,
    cellSetLabelsVisible,
    setCellSetLabelsVisible,
    cellSetLabelSize,
    setCellSetLabelSize,
    cellSetPolygonsVisible,
    setCellSetPolygonsVisible,
    cellColorEncoding,
    setCellColorEncoding,
  } = props;

  const observationsLabelNice = capitalize(observationsLabel);

  const classes = useStyles();

  function handleRadiusChange(event, value) {
    setCellRadius(value);
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

  return (
    <OptionsContainer>
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
        <TableCell className={classes.labelCell}>
          {observationsLabelNice} Radius
        </TableCell>
        <TableCell className={classes.inputCell}>
          <Slider
            classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
            value={cellRadius}
            onChange={handleRadiusChange}
            aria-labelledby="cell-radius-slider"
            valueLabelDisplay="auto"
            step={0.25}
            min={0.25}
            max={8}
          />
        </TableCell>
      </TableRow>
      <CellColorEncodingOption
        observationsLabel={observationsLabel}
        cellColorEncoding={cellColorEncoding}
        setCellColorEncoding={setCellColorEncoding}
      />
    </OptionsContainer>
  );
}
