import React from 'react';
import plur from 'plur';
import { TableCell, TableRow, TextField } from '@material-ui/core';
import { usePlotOptionsStyles, OptionSelect } from '@vitessce/vit-s';
import { capitalize } from '@vitessce/utils';

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

  const classes = usePlotOptionsStyles();

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
      <TableRow key="scatterplot-gating-gene-select">
        <TableCell className={classes.labelCell} variant="head" scope="row">
          {capitalize(plur(featureType, geneSelectOptions?.length))}
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            key="scatterplot-gating-gene-select"
            multiple
            className={classes.select}
            value={[gatingFeatureSelectionX, gatingFeatureSelectionY].filter(v => v)}
            onChange={handleGeneSelectChange}
            inputProps={{
              id: 'scatterplot-gating-gene-select',
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
      <TableRow key="scatterplot-gating-transform-select">
        <TableCell className={classes.labelCell} variant="head" scope="row">
          Transform
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            key="scatterplot-gating-transform-select"
            className={classes.select}
            value={gatingFeatureValueTransform === null ? '' : gatingFeatureValueTransform}
            onChange={handleTransformChange}
            inputProps={{
              id: 'scatterplot-gating-transform-select',
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
      <TableRow key="scatterplot-gating-transform-coefficient">
        <TableCell className={classes.labelCell} variant="head" scope="row">
          Transform Coefficient
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <TextField
            label="Trasnform Coefficient"
            type="number"
            onChange={handleTransformCoefficientChange}
            value={gatingFeatureValueTransformCoefficient}
            InputLabelProps={{
              shrink: true,
            }}
            id="scatterplot-gating-transform-coefficient"
          />
        </TableCell>
      </TableRow>
    </>
  );
}
