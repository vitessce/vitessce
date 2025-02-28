import React, { useState, useCallback, useMemo } from 'react';
import {
  useAsyncFunction,
  useViewConfigStoreApi,
  useSetViewConfig,
  useViewConfig,
  useCoordination,
  useLoaders,
  useComparisonMetadata,
  useMatchingLoader,
  useColumnNameMapping,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';


export function ComparativeHeadingSubscriber(props) {
  const {
    coordinationScopes,
  } = props;

  const loaders = useLoaders();

  const [{
    dataset,
    obsType,
    sampleType,
    sampleSetSelection,
    featureSelection,
  }, {
    setSampleSetSelection,
    setFeatureSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.COMPARATIVE_HEADING],
    coordinationScopes,
  );

  return (
    <>
      {sampleSetSelection && sampleSetSelection.length === 2 ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
          <div style={{ width: '45%' }}><h2>{sampleSetSelection?.[0]?.at(-1)}</h2></div>
          <div style={{ width: '5%' }}><h2 style={{ textAlign: 'right' }}>vs.&nbsp;</h2></div>
          <div style={{ width: '50%' }}><h2>{sampleSetSelection?.[1]?.at(-1)}</h2></div>
        </div>
      ) : null}
    </>
  );
}
