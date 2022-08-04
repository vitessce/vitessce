import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import { useStyles } from '../shared-plot-options/styles';
import OptionsContainer from '../shared-plot-options/OptionsContainer';
import OptionSelect from '../shared-plot-options/OptionSelect';

export default function CellSetExpressionPlotOptions(props) {
  const {
    featureValueTransform,
    setFeatureValueTransform,
    featureValueTransformCoefficient,
    setFeatureValueTransformCoefficient,
    transformOptions,
  } = props;
  const classes = useStyles();

  const handleTransformChange = (event) => {
    setFeatureValueTransform(event.target.value === '' ? null : event.target.value);
  };

  // Feels a little hacky, but I think this is the best way to handle
  // the limitations of the v4 material-ui number input.
  const handleTransformCoefficientChange = (event) => {
    const { value } = event.target;
    if (!value) {
      setFeatureValueTransformCoefficient(value);
    } else {
      const newCoefficient = Number(value);
      if (!Number.isNaN(newCoefficient) && newCoefficient >= 0) {
        setFeatureValueTransformCoefficient(value);
      }
    }
  };

  return (
    <OptionsContainer>
      <TableRow>
        <TableCell className={classes.labelCell}>Transform</TableCell>
        <TableCell className={classes.inputCell}>
          <OptionSelect
            key="gating-transform-select"
            className={classes.select}
            value={featureValueTransform === null ? '' : featureValueTransform}
            onChange={handleTransformChange}
            inputProps={{
              id: 'scatterplot-transform-select',
            }}
          >
            {transformOptions.map(opt => (
              <option key={opt.name} value={opt.value === null ? '' : opt.value}>
                {opt.name}
              </option>
            ))}
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow key="transform-coefficient-option-row">
        <TableCell className={classes.labelCell}>
          Transform Coefficient
        </TableCell>
        <TableCell className={classes.inputCell}>
          <TextField
            label="Number"
            type="number"
            onChange={handleTransformCoefficientChange}
            value={featureValueTransformCoefficient}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </TableCell>
      </TableRow>
    </OptionsContainer>
  );
}
