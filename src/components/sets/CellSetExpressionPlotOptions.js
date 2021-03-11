import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { useStyles } from '../shared-plot-options/styles';
import OptionsContainer from '../shared-plot-options/OptionsContainer';

export default function CellSetExpressionPlotOptions(props) {
  const { toggleLog2Transform, useLog2Transform } = props;
  const classes = useStyles();

  function handleLog2TransformChange() {
    toggleLog2Transform();
  }

  return (
    <OptionsContainer>
      <TableRow>
        <TableCell className={classes.labelCell}>Use Log2 Transform</TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={useLog2Transform}
            onChange={handleLog2TransformChange}
            name="scatterplot-option-cell-set-labels"
            color="default"
          />
        </TableCell>
      </TableRow>
    </OptionsContainer>
  );
}
