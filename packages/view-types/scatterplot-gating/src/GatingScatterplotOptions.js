import React from 'react';
import { useId } from 'react-aria';
import { TableCell, TableRow, TextField } from '@vitessce/styles';
import { usePlotOptionsStyles, OptionSelect } from '@vitessce/vit-s';
import { capitalize, pluralize as plur } from '@vitessce/utils';

export default function GatingScatterplotOptions(props) {
  const {
    featureType,
    gatingFeatureSelectionX,
    setGatingFeatureSelectionX,
    gatingFeatureSelectionY,
    setGatingFeatureSelectionY,
    gatingFeatureValueTransform,
    setGatingFeatureValueTransform,
    gatingFeatureValueTransformCoefficient,
    setGatingFeatureValueTransformCoefficient,
    geneSelectOptions,
    transformOptions,
  } = props;

  const gatingScatterplotOptionsId = useId();

  const { classes } = usePlotOptionsStyles();

  // Handlers for custom option field changes.
  const handleGeneSelectChange = (event) => {
    const { options } = event.target;
    const newValues = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        newValues.push(options[i].value);
      }
    }

    if (newValues.length === 1
          && gatingFeatureSelectionX
          && !gatingFeatureSelectionY
          && newValues[0] !== gatingFeatureSelectionX) {
      setGatingFeatureSelectionY(newValues[0]);
    } else if (newValues.length <= 2) {
      setGatingFeatureSelectionX(newValues[0]);
      setGatingFeatureSelectionY(newValues[1]);
    }
  };

  const handleTransformChange = (event) => {
    setGatingFeatureValueTransform(event.target.value === '' ? null : event.target.value);
  };

  // Feels a little hacky, but I think this is the best way to handle
  // the limitations of the v4 material-ui number input.
  const handleTransformCoefficientChange = (event) => {
    const { value } = event.target;
    if (!value) {
      setGatingFeatureValueTransformCoefficient(value);
    } else {
      const newCoefficient = Number(value);
      if (!Number.isNaN(newCoefficient) && newCoefficient >= 0) {
        setGatingFeatureValueTransformCoefficient(value);
      }
    }
  };

  return (
    <>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`scatterplot-gating-gene-select-${gatingScatterplotOptionsId}`}
          >
            {capitalize(plur(featureType, geneSelectOptions?.length))}
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            multiple
            className={classes.select}
            value={[gatingFeatureSelectionX, gatingFeatureSelectionY].filter(v => v)}
            onChange={handleGeneSelectChange}
            inputProps={{
              id: `scatterplot-gating-gene-select-${gatingScatterplotOptionsId}`,
            }}
          >
            {geneSelectOptions.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`scatterplot-gating-transform-select-${gatingScatterplotOptionsId}`}
          >
            Transform
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            className={classes.select}
            value={gatingFeatureValueTransform === null ? '' : gatingFeatureValueTransform}
            onChange={handleTransformChange}
            inputProps={{
              id: `scatterplot-gating-transform-select-${gatingScatterplotOptionsId}`,
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
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`scatterplot-gating-transform-coefficient-${gatingScatterplotOptionsId}`}
          >
            Transform Coefficient
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <TextField
            label="Transform Coefficient"
            type="number"
            onChange={handleTransformCoefficientChange}
            value={gatingFeatureValueTransformCoefficient}
            slotProps={{ input: { shrink: true } }}
            id={`scatterplot-gating-transform-coefficient-${gatingScatterplotOptionsId}`}
          />
        </TableCell>
      </TableRow>
    </>
  );
}
