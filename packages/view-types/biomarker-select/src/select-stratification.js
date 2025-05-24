import React from 'react';
import { Grid, RadioGroup, FormControl, FormLabel, Radio, FormControlLabel, Typography } from '@vitessce/styles';


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
      stratifications.find(s => s.stratificationId === value) ?? null,
    );
  }

  const sampleSetOptions = stratifications?.filter(s => s.stratificationType === 'sampleSet');
  const structuralRegionOptions = stratifications?.filter(s => s.stratificationType === 'structural-region');

  const hasSampleSetOptions = sampleSetOptions && sampleSetOptions.length > 0;
  const hasStructuralRegionOptions = structuralRegionOptions && structuralRegionOptions.length > 0;

  return (
    <Grid size={12}>
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
          {hasSampleSetOptions ? (
            <>
              <FormLabel>By participant group (clinical):</FormLabel>
              {sampleSetOptions.map(s => (
                <FormControlLabel
                  value={s.stratificationId}
                  control={<Radio />}
                  key={s.name}
                  label={s.name}
                />
              ))}
            </>
          ) : null}
          {hasStructuralRegionOptions ? (
            <>
              <FormLabel>By segmentation-defined spatial region (structural):</FormLabel>
              {structuralRegionOptions.map(s => (
                <FormControlLabel
                  value={s.stratificationId}
                  control={<Radio />}
                  key={s.name}
                  label={s.name}
                />
              ))}
            </>
          ) : null}
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
          {stratifications ? stratifications
            .filter(s => s.stratificationType === 'structural-region').map((s) => (
              <FormControlLabel value={s.stratificationId} control={<Radio />} label={s.name} />
            )) : null}
        </RadioGroup>
      </FormControl>
      */}
    </Grid>
  );
}
