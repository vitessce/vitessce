import React from 'react';
import { useId } from 'react-aria';
import { isEqual } from 'lodash-es';
import { TableCell, TableRow } from '@vitessce/styles';
import { capitalize } from '@vitessce/utils';
import {
  usePlotOptionsStyles, OptionSelect, OptionsContainer,
} from '@vitessce/vit-s';

export default function TreemapOptions(props) {
  const {
    children,
    obsType,
    sampleType,

    hierarchyLevels,
    setHierarchyLevels,

    obsColorEncoding,
    setObsColorEncoding,

  } = props;

  const treemapOptionsId = useId();
  const { classes } = usePlotOptionsStyles();

  function handleColorEncodingChange(event) {
    setObsColorEncoding(event.target.value);
  }

  function handleHierarchyLevelsOrderingChange(event) {
    if (event.target.value === 'sampleSet') {
      setHierarchyLevels(['sampleSet', 'obsSet']);
    } else {
      setHierarchyLevels(['obsSet', 'sampleSet']);
    }
  }

  const primaryHierarchyLevel = isEqual(hierarchyLevels, ['sampleSet', 'obsSet']) ? 'sampleSet' : 'obsSet';

  return (
    <OptionsContainer>
      {children}
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`cell-color-encoding-select-${treemapOptionsId}`}
          >
            Color Encoding
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            className={classes.select}
            value={obsColorEncoding}
            onChange={handleColorEncodingChange}
            inputProps={{
              id: `cell-color-encoding-select-${treemapOptionsId}`,
            }}
          >
            <option value="cellSetSelection">{capitalize(obsType)} Sets</option>
            <option value="sampleSetSelection">{capitalize(sampleType)} Sets</option>
          </OptionSelect>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={`treemap-set-hierarchy-levels-${treemapOptionsId}`}
          >
            Primary Hierarchy Level
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            className={classes.select}
            value={primaryHierarchyLevel}
            onChange={handleHierarchyLevelsOrderingChange}
            inputProps={{
              id: `hierarchy-level-select-${treemapOptionsId}`,
            }}
          >
            <option value="obsSet">{capitalize(obsType)} Sets</option>
            <option value="sampleSet">{capitalize(sampleType)} Sets</option>
          </OptionSelect>
        </TableCell>
      </TableRow>
    </OptionsContainer>
  );
}
