import React, { useMemo } from 'react';
import {
  useCoordination,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { EmbeddingScatterplotSubscriber } from './EmbeddingScatterplotSubscriber.js';


/**
 * A subscriber component for a pair of embedding scatterplots.
 * This dual implementation
 * interprets a user specification of a pair of CoordinationType.SAMPLE_SET_FILTER
 * coordination types to stratify of the data.
 * @param {object} props
 * @param {number} props.uuid The unique identifier for this component.
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title An override value for the component title.
 * @param {number} props.averageFillDensity Override the average fill density calculation
 * when using dynamic opacity mode.
 */
export function DualEmbeddingScatterplotSubscriber(props) {
  const {
    coordinationScopes,
  } = props;

  // Get "props" from the coordination space.
  const [{
    sampleSetSelection,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.DUAL_SCATTERPLOT], coordinationScopes);

  const caseSampleSetSelection = useMemo(() => (
    sampleSetSelection?.[0]
      ? [sampleSetSelection[0]]
      : null
  ), [sampleSetSelection]);
  const ctrlSampleSetSelection = useMemo(() => (
    sampleSetSelection?.[1]
      ? [sampleSetSelection[1]]
      : null
  ), [sampleSetSelection]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row' }}>
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
        <EmbeddingScatterplotSubscriber
          {...props}
          sampleSetSelection={caseSampleSetSelection}
        />
      </div>
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
        <EmbeddingScatterplotSubscriber
          {...props}
          title=""
          sampleSetSelection={ctrlSampleSetSelection}
        />
      </div>
    </div>
  );
}
