import React, { useCallback, useMemo, Suspense, useRef, useEffect, useState } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';

import { cloneDeep, get, isEqual, forEach, throttle } from 'lodash-es';
import { useNeuroglancerViewerState, useSetNeuroglancerViewerState } from '@vitessce/vit-s';
import { useStyles, globalNeuroglancerCss } from './styles.js';


const LazyReactNeuroglancer = React.lazy(async () => {
  const ReactNeuroglancer = await import('@janelia-flyem/react-neuroglancer');
  return ReactNeuroglancer;
});

function createWorker() {
  return new ChunkWorker();
}


export function Neuroglancer({ cellColorMapping }) {
  const viewerState = useNeuroglancerViewerState();
  const setViewerState = useSetNeuroglancerViewerState();
  const classes = useStyles();
  const bundleRoot = useMemo(() => createWorker(), []);
  const viewerRef = useRef(null);
  const latestStateRef = useRef(viewerState);
  const neuroglancerStateRef = useRef(viewerState);
  const changedPropertiesRef = useRef({});
  const isInitialLoad = useRef(true);


  const throttledHandleStateChanged = useRef(throttle((newState) => {
    const differences = cloneDeep(newState);
    const changedProps = {};

    forEach(differences, (value, key) => {
      const previousValue = get(latestStateRef.current, key);
      if (!isEqual(value, previousValue)) {
        changedProps[key] = value;
      }
    });

    changedPropertiesRef.current = changedProps;
    if (!isEqual(newState, latestStateRef.current)) {
      latestStateRef.current = newState;
    }

    if (!isEqual(neuroglancerStateRef.current, newState)) {
      neuroglancerStateRef.current = newState;
    }
  }, 100));

  useEffect(() => {
    if (neuroglancerStateRef.current && neuroglancerStateRef.current.layers) {
      const updatedNeuroglancerState = {
        ...neuroglancerStateRef.current,
        layers: neuroglancerStateRef.current.layers.map((layer, index) => (index === 0
          ? {
            ...layer,
            segments: Object.keys(cellColorMapping).map(String),
            segmentColors: cellColorMapping,
          }
          : layer)),
      };
      setViewerState(updatedNeuroglancerState);
    }
  }, [cellColorMapping]);

  const handleStateChanged = useCallback((newState) => {
    // Ignoring the many state changes during the initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    // To avoid updating state when this happens
    if (newState && newState.dimensions === undefined) {
      console.warn('Filtered out state update with dimensions: undefined');
      return;
    }

    // if (initialNeuroglancerStateRef.current
    //   && isEqual(newState, initialNeuroglancerStateRef.current)) {
    //   return;
    // }
    throttledHandleStateChanged.current(newState);
  }, []);

  return (
    <>
      <style>{globalNeuroglancerCss}</style>
      <div className={classes.neuroglancerWrapper}>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyReactNeuroglancer
            brainMapsClientId="NOT_A_VALID_ID"
            viewerState={viewerState}
            onViewerStateChanged={handleStateChanged}
            bundleRoot={bundleRoot}
            ref={viewerRef}
          />
        </Suspense>
      </div>
    </>
  );
}
