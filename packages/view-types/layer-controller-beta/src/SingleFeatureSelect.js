import React, { useCallback } from 'react';
import {
  Grid,
  Paper,
  NativeSelect,
} from '@vitessce/styles';
import {
  resolveFeatureAggregationStrategy,
  RESERVED_FEATURE_AGGREGATION_STRATEGIES,
} from '@vitessce/utils';
import {
  useControllerSectionStyles,
  useSelectStyles,
} from './styles.js';

const FEATURE_INDEX_OPTION_PREFIX = 'feature-index-';

// Get the <option> value for a feature.
// Features are referred to by name, unless the name collides with
// a reserved featureAggregationStrategy value (e.g., a feature named "mean"),
// in which case they are referred to by index.
function getFeatureOptionValue(featureName, featureIndex) {
  return RESERVED_FEATURE_AGGREGATION_STRATEGIES.includes(featureName)
    ? `${FEATURE_INDEX_OPTION_PREFIX}${featureIndex}`
    : featureName;
}

// Get the <option> value corresponding to a featureAggregationStrategy value.
function getSelectedOptionValue(featureAggregationStrategy, featureSelection) {
  // The spatial view falls back to 'first' when the strategy is null.
  const resolvedStrategy = resolveFeatureAggregationStrategy(
    featureAggregationStrategy, featureSelection,
  ) ?? 'first';
  if (resolvedStrategy === 'mean' || resolvedStrategy === 'sum') {
    return resolvedStrategy;
  }
  if (resolvedStrategy === 'difference' && featureSelection.length === 2) {
    return resolvedStrategy;
  }
  let featureIndex = 0;
  if (resolvedStrategy === 'last') {
    featureIndex = featureSelection.length - 1;
  } else if (typeof resolvedStrategy === 'number') {
    featureIndex = resolvedStrategy;
  }
  // Remaining cases ('first', or 'difference' with a number of features
  // other than two) render the first feature.
  return getFeatureOptionValue(featureSelection[featureIndex], featureIndex);
}

// Sub-row for selecting which of the selected features
// (or which combination of them) is used for colormap-based coloring
// of a layer or channel.
export function SingleFeatureSelect(props) {
  const {
    featureSelection,
    featureAggregationStrategy,
    setFeatureAggregationStrategy,
  } = props;

  const { classes: lcClasses } = useControllerSectionStyles();
  const { classes: selectClasses } = useSelectStyles();

  const selectedOptionValue = getSelectedOptionValue(
    featureAggregationStrategy, featureSelection,
  );

  // Store the feature name rather than its index, so that the selection
  // remains valid when features are added to or removed from the featureSelection.
  const handleChange = useCallback((e) => {
    const { value } = e.target;
    if (value.startsWith(FEATURE_INDEX_OPTION_PREFIX)) {
      setFeatureAggregationStrategy(
        Number(value.substring(FEATURE_INDEX_OPTION_PREFIX.length)),
      );
    } else {
      setFeatureAggregationStrategy(value);
    }
  }, [setFeatureAggregationStrategy]);

  return (
    <Grid className={lcClasses.layerControllerGrid}>
      <Paper elevation={2} className={lcClasses.layerControllerSubRow}>
        <NativeSelect
          onChange={handleChange}
          value={selectedOptionValue}
          inputProps={{ 'aria-label': 'Select the feature used for colormap-based coloring' }}
          classes={{ root: selectClasses.selectRoot }}
        >
          <optgroup label="Single feature">
            {featureSelection.map((featureName, featureIndex) => {
              const optionValue = getFeatureOptionValue(featureName, featureIndex);
              return (
                <option key={optionValue} value={optionValue}>{featureName}</option>
              );
            })}
          </optgroup>
          <optgroup label="Combine features">
            <option value="mean">Mean</option>
            <option value="sum">Sum</option>
            {featureSelection.length === 2 ? (
              <option value="difference">
                {`Difference (${featureSelection[0]} − ${featureSelection[1]})`}
              </option>
            ) : null}
          </optgroup>
        </NativeSelect>
      </Paper>
    </Grid>
  );
}
