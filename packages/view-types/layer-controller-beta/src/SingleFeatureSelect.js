import React, { useCallback } from 'react';
import {
  Grid,
  Paper,
  NativeSelect,
} from '@vitessce/styles';
import { resolveFeatureAggregationStrategy } from '@vitessce/utils';
import {
  useControllerSectionStyles,
  useSelectStyles,
} from './styles.js';

// Get the name of the single feature selected by a featureAggregationStrategy value.
// Returns null for strategies that combine multiple features (sum, mean, etc.).
function getSelectedFeatureName(featureAggregationStrategy, featureSelection) {
  // The spatial view falls back to 'first' when the strategy is null.
  const resolvedStrategy = resolveFeatureAggregationStrategy(
    featureAggregationStrategy, featureSelection,
  ) ?? 'first';
  if (resolvedStrategy === 'first') {
    return featureSelection[0];
  }
  if (resolvedStrategy === 'last') {
    return featureSelection.at(-1);
  }
  if (typeof resolvedStrategy === 'number') {
    return featureSelection[resolvedStrategy];
  }
  return null;
}

// Sub-row for selecting which of the selected features
// is used for colormap-based coloring of a layer or channel.
export function SingleFeatureSelect(props) {
  const {
    featureSelection,
    featureAggregationStrategy,
    setFeatureAggregationStrategy,
  } = props;

  const { classes: lcClasses } = useControllerSectionStyles();
  const { classes: selectClasses } = useSelectStyles();

  const selectedFeatureName = getSelectedFeatureName(
    featureAggregationStrategy, featureSelection,
  );

  // Store the feature name rather than its index, so that the selection
  // remains valid when features are added to or removed from the featureSelection.
  const handleFeatureChange = useCallback((e) => {
    setFeatureAggregationStrategy(e.target.value);
  }, [setFeatureAggregationStrategy]);

  return (
    <Grid className={lcClasses.layerControllerGrid}>
      <Paper elevation={2} className={lcClasses.layerControllerSubRow}>
        <NativeSelect
          onChange={handleFeatureChange}
          value={selectedFeatureName ?? ''}
          inputProps={{ 'aria-label': 'Select the feature used for colormap-based coloring' }}
          classes={{ root: selectClasses.selectRoot }}
        >
          {selectedFeatureName === null ? (
            <option value="" disabled>Select a feature</option>
          ) : null}
          {featureSelection.map(featureName => (
            <option key={featureName} value={featureName}>{featureName}</option>
          ))}
        </NativeSelect>
      </Paper>
    </Grid>
  );
}
