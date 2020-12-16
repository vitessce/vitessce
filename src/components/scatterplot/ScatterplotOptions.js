import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/core/Slider';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';

const useStyles = makeStyles(theme => ({
  box: {
    boxSizing: 'border-box',
  },
  checkbox: {
    padding: '3px',
    color: theme.palette.primaryForeground,
    '&:checked': {
      color: theme.palette.primaryForeground,
    },
  },
  slider: {
    color: theme.palette.primaryForeground,
    minWidth: '60px',
    padding: '10px 0 6px 0',
  },
  sliderValueLabel: {
    '& span': {
      '& span': {
        color: theme.palette.primaryBackground,
      },
    },
  },
  tableContainer: {
    overflow: 'hidden',
  },
  labelCell: {
    padding: '2px 8px 2px 16px',
  },
  inputCell: {
    padding: '2px 16px 2px 8px',
    overflowX: 'hidden',
  },
}));

export default function ScatterplotOptions(props) {
  const {
    cellRadius,
    setCellRadius,
    cellSetLabelsVisible,
    setCellSetLabelsVisible,
    cellSetLabelSize,
    setCellSetLabelSize,
    cellSetPolygonsVisible,
    setCellSetPolygonsVisible,
  } = props;

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
    <Box className={classes.box}>
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.table} size="small">
          <TableBody>
            <TableRow>
              <TableCell className={classes.labelCell}>Cell Set Labels Visible</TableCell>
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
              <TableCell className={classes.labelCell}>Cell Set Label Size</TableCell>
              <TableCell className={classes.inputCell}>
                <Slider
                  classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
                  value={cellSetLabelSize}
                  onChange={handleLabelSizeChange}
                  aria-labelledby="cell-set-label-size-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={8}
                  max={36}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.labelCell}>Cell Set Polygons Visible</TableCell>
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
              <TableCell className={classes.labelCell}>Cell Radius</TableCell>
              <TableCell className={classes.inputCell}>
                <Slider
                  classes={{ root: classes.slider, valueLabel: classes.sliderValueLabel }}
                  value={cellRadius}
                  onChange={handleRadiusChange}
                  aria-labelledby="cell-radius-slider"
                  valueLabelDisplay="auto"
                  step={0.25}
                  min={0.25}
                  max={5}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
