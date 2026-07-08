import React from 'react';
import { useId } from 'react-aria';
import { TableCell, TableRow, TextField } from '@vitessce/styles';
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

  const gatingScatterplotOptionsId = useId();
  const gatingScatterplotGeneXId = useId();
  const gatingScatterplotGeneYId = useId();

  const { classes } = usePlotOptionsStyles();

  // Handlers for custom option field changes.
  const handleSelectionX = (event) => {
    setGatingFeatureSelectionX(event.target.value === '' ? null : event.target.value);
  };

  const handleSelectionY = (event) => {
    setGatingFeatureSelectionY(event.target.value === '' ? null : event.target.value);
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
            htmlFor={`scatterplot-gating-gene-select-${gatingScatterplotGeneXId}`}
          >
            {capitalize(featureType)} along X
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            className={classes.select}
            value={gatingFeatureSelectionX ?? ''}
            onChange={handleSelectionX}
            inputProps={{
              id: `scatterplot-gating-gene-select-${gatingScatterplotGeneXId}`,
            }}
          >
            <option value="">
              None
            </option>
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
            htmlFor={`scatterplot-gating-gene-select-${gatingScatterplotGeneYId}`}
          >
            {capitalize(featureType)} along Y
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            className={classes.select}
            value={gatingFeatureSelectionY ?? ''}
            onChange={handleSelectionY}
            inputProps={{
              id: `scatterplot-gating-gene-select-${gatingScatterplotGeneYId}`,
            }}
          >
            <option value="">
              None
            </option>
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
            slotProps={{ inputLabel: { shrink: true } }}
            id={`scatterplot-gating-transform-coefficient-${gatingScatterplotOptionsId}`}
          />
        </TableCell>
      </TableRow>
    </>
  );
}
