import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { useStyles } from '../shared-plot-options/styles';
import OptionsContainer from '../shared-plot-options/OptionsContainer';

export default function CellSetExpressionPlotOptions(props) {
  const { toggleGeneExpressionTransform, useGeneExpressionTransform } = props;
  const classes = useStyles();

  function handleGeneExpressionTransformChange() {
    toggleGeneExpressionTransform();
  }

  return (
    <OptionsContainer>
      <TableRow>
        <TableCell className={classes.labelCell}>Use Log2 Transform</TableCell>
        <TableCell className={classes.inputCell}>
          <Checkbox
            className={classes.checkbox}
            checked={Boolean(useGeneExpressionTransform)}
            onChange={handleGeneExpressionTransformChange}
            name="scatterplot-option-cell-set-labels"
            color="default"
          />
        </TableCell>
      </TableRow>
    </OptionsContainer>
  );
}
