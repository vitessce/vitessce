import React from 'react';
import { Grid, RadioGroup, FormControl, FormLabel, Radio, FormControlLabel, Typography } from '@material-ui/core';


export function SelectStratification(props) {
  const {
    stratifications,
    currentStratificationSelection: currentStratificationSelectionProp,
    setCurrentStratificationSelection: setCurrentStratificationSelectionProp,
  } = props;

  // Convert back and forth from the special value '__all__' to null.
  const currentStratificationSelection = currentStratificationSelectionProp === null
    ? '__all__'
    : currentStratificationSelectionProp.stratificationId;
  function setCurrentStratificationSelection(event, value) {
    setCurrentStratificationSelectionProp(
      stratifications.find(s => s.stratificationId === value) ?? null
    );
  }

  return (
    <Grid item xs={12}>
      <Typography variant="h6">
        Select a stratification option:
      </Typography>
      <FormControl>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          value={currentStratificationSelection}
          onChange={setCurrentStratificationSelection}
          name="radio-buttons-group"
        >
          <FormControlLabel value="__all__" control={<Radio />} label="No stratification" />
          <FormLabel>By participant group (clinical):</FormLabel>
          {stratifications ? stratifications.filter(s => s.groupType === 'clinical').map((s) => (
            <FormControlLabel value={s.stratificationId} control={<Radio />} label={s.name} />
          )) : null}
          <FormLabel>By segmentation-defined spatial region (structural):</FormLabel>
          {stratifications ? stratifications.filter(s => s.groupType === 'structural-region').map((s) => (
            <FormControlLabel value={s.stratificationId} control={<Radio />} label={s.name} />
          )) : null}
        </RadioGroup>
      </FormControl>
      {/* // TODO: store participant-level and region-level stratification options independently
      <Typography variant="h6">
        Define case-control stratification (region-level):
      </Typography>
      <FormControl>
      <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label-2"
          value={currentStratificationSelection}
          onChange={setCurrentStratificationSelection}
          name="radio-buttons-group-2"
        >
          <FormLabel>By segmentation-defined spatial region (structural):</FormLabel>
          {stratifications ? stratifications.filter(s => s.groupType === 'structural-region').map((s) => (
            <FormControlLabel value={s.stratificationId} control={<Radio />} label={s.name} />
          )) : null}
        </RadioGroup>
      </FormControl>
      */}
    </Grid>
  );
}