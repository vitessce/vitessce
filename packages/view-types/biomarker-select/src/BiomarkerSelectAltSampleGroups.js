/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { Button, ButtonGroup, Grid, Tooltip, NativeSelect } from '@vitessce/styles';
import { isEqual } from 'lodash-es';
import { BiomarkerSelectAltGeneAutocomplete } from './BiomarkerSelectAltGeneAutocomplete.js';
import { useStyles } from './styles.js';


export function BiomarkerSelectAltSampleGroups(props) {
  const {
    setSampleSetFilter,
    setSampleSetSelection,

    mode: modeProp,
    setMode,
    step: stepProp,
    setStep,
    currentModalityAgnosticSelection,
    setCurrentModalityAgnosticSelection,
    currentModalitySpecificSelection,
    setCurrentModalitySpecificSelection,

    autocompleteNode,

    getEdges,
    stratifications,
    onFinish,

    currentStratificationSelection: currentStratificationSelectionProp,
    setCurrentStratificationSelection: setCurrentStratificationSelectionProp,
  } = props;
  const { classes } = useStyles();

  const [lhsSelectedGroup, setLhsSelectedGroup] = useState(null);
  const [rhsSelectedGroup, setRhsSelectedGroup] = useState(null);

  // Convert back and forth from the special value '__all__' to null.
  const currentStratificationSelection = currentStratificationSelectionProp === null
    ? '__all__'
    : currentStratificationSelectionProp.stratificationId;
  function setCurrentStratificationSelection(event, value) {
    setCurrentStratificationSelectionProp(
      stratifications.find(s => s.stratificationId === value) ?? null,
    );
  }

  const sampleSetOptions = stratifications?.filter(s => s.stratificationType === 'sampleSet');
  const structuralRegionOptions = stratifications?.filter(s => s.stratificationType === 'structural-region');

  const hasSampleSetOptions = sampleSetOptions && sampleSetOptions.length > 0;
  const hasStructuralRegionOptions = structuralRegionOptions && structuralRegionOptions.length > 0;

  const lhsOptions = useMemo(() => {
    if (sampleSetOptions) {
      const result = [];
      const withDuplicates = sampleSetOptions.map(o => o.sampleSets).flat();
      withDuplicates.forEach((setPath) => {
        if (!result.find(r => isEqual(r.path, setPath))) {
          const rhsOptionsForLhs = [];
          sampleSetOptions.forEach((o) => {
            const pathPair = o.sampleSets;
            if (isEqual(pathPair[0], setPath)) {
              const otherPath = pathPair[1];
              rhsOptionsForLhs.push({
                name: `${otherPath[0]}: ${otherPath[1]}`,
                path: otherPath,
                sampleSets: o.sampleSets,
                stratificationId: o.stratificationId,
              });
            } else if (isEqual(pathPair[1], setPath)) {
              const otherPath = pathPair[0];
              rhsOptionsForLhs.push({
                name: `${otherPath[0]}: ${otherPath[1]}`,
                path: otherPath,
                // Reverse the order.
                sampleSets: [o.sampleSets[1], o.sampleSets[0]],
                stratificationId: o.stratificationId,
              });
            }
          });

          result.push({
            name: `${setPath[0]}: ${setPath[1]}`,
            path: setPath,
            rhsOptions: rhsOptionsForLhs,
          });
        }
      });
      return result;
    }
    return [];
  }, [sampleSetOptions]);

  const rhsOptions = useMemo(() => {
    if (sampleSetOptions && lhsOptions && lhsSelectedGroup) {
      const lhsOption = lhsOptions.find(o => o.name === lhsSelectedGroup);
      return lhsOption ? lhsOption.rhsOptions : [];
    }
    return [];
  }, [sampleSetOptions, lhsOptions, lhsSelectedGroup]);


  function handleFirstGroupChange(event) {
    setLhsSelectedGroup(event.target.value);

    // Update the sampleSetFilter and sampleSetSelection.
    if (event.target.value === '__all__') {
      setSampleSetFilter(null);
      setSampleSetSelection(null);
    } else {
      const lhsOption = lhsOptions.find(o => o.name === event.target.value);
      if (lhsOption) {
        setSampleSetFilter([lhsOption.path]);
        setSampleSetSelection([lhsOption.path]);
      }
    }
  }

  function handleSecondGroupChange(event) {
    setRhsSelectedGroup(event.target.value);

    // Update the sampleSetFilter and sampleSetSelection.
    if (event.target.value === '__none__') {
      const lhsOption = lhsOptions.find(o => o.name === lhsSelectedGroup);
      if (lhsOption) {
        setSampleSetFilter([lhsOption.path]);
        setSampleSetSelection([lhsOption.path]);
      }
    } else {
      const rhsOption = rhsOptions.find(o => o.name === event.target.value);
      if (rhsOption) {
        setSampleSetFilter(rhsOption.sampleSets);
        setSampleSetSelection(rhsOption.sampleSets);
      }
    }
  }

  return (
    <>
      <Grid container size={12}>
        <Grid container size={4}>
          <span style={{ lineHeight: '50px' }}>in:&nbsp;</span>
        </Grid>
        <Grid container size={8}>
          <NativeSelect
            onChange={handleFirstGroupChange}
            value={lhsSelectedGroup ?? '__all__'}
            variant="standard"
            sx={{ width: '100%' }}
          >
            <option value="__all__">All</option>
            {hasSampleSetOptions ? (
              <>
                {lhsOptions.map(o => (
                  <option value={o.name}>{o.name}</option>
                ))}
              </>
            ) : null}
          </NativeSelect>
        </Grid>
      </Grid>
      <Grid container size={12}>
        <Grid container size={4}>
          <span style={{ lineHeight: '50px' }}>compare to:&nbsp;</span>
        </Grid>
        <Grid container size={8}>
          <NativeSelect
            onChange={handleSecondGroupChange}
            value={rhsSelectedGroup ?? '__none__'}
            variant="standard"
            sx={{ width: '100%' }}
          >
            <option value="__none__">None</option>
            {hasSampleSetOptions ? (
              <>
                {rhsOptions.map(o => (
                  <option value={o.name}>{o.name}</option>
                ))}
              </>
            ) : null}
          </NativeSelect>
        </Grid>
      </Grid>
    </>
  );
}
