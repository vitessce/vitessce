import React, { useCallback, useMemo, Suspense, useRef, useEffect, useState } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';
import { useStyles, globalNeuroglancerCss } from './styles.js';

import { cloneDeep, get, isEqual, forEach, throttle } from 'lodash-es';
import { useNeuroglancerViewerState, useSetNeuroglancerViewerState } from '@vitessce/vit-s';


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
  console.log("N rendered");
  const classes = useStyles();
  const bundleRoot = useMemo(() => createWorker(), []);
  const viewerRef = useRef(null);
  const latestStateRef = useRef(viewerState);
  const neuroglancerStateRef = useRef(viewerState); // Use ref as single source
  const changedPropertiesRef = useRef({});
  const isInitialLoad = useRef(true);
  const initialNeuroglancerStateRef = useRef(null);
  const isComponentMounted = useRef(false);
  const cellColorMappingUpdateRef = useRef(false);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  const throttledHandleStateChanged = useRef(throttle((newState) => {
    const differences = cloneDeep(newState);
    let changedProps = {};

    forEach(differences, (value, key) => {
      const previousValue = get(latestStateRef.current, key);
      if (!isEqual(value, previousValue)) {
        changedProps[key] = value;
      }
    });

    changedPropertiesRef.current = changedProps;
    console.log("changed", changedProps);

    if (!isEqual(newState, latestStateRef.current)) {
      latestStateRef.current = newState;
    }

    neuroglancerStateRef.current = newState;

    // if (!isEqual(neuroglancerStateRef.current, newState)) {
    //   neuroglancerStateRef.current = newState;
    // }
  }, 100));

  const handleStateChanged = useCallback((newState) => {
    if (isInitialLoad.current) {
      console.log("current");
      isInitialLoad.current = false;
      return;
    }
    if (newState && newState.dimensions === undefined) {
      console.warn("Filtered out state update with dimensions: undefined");
      return;
    }

    if (initialNeuroglancerStateRef.current && isEqual(newState, initialNeuroglancerStateRef.current)) {
      console.log("State update skipped: no actual change");
      return;
    }
    throttledHandleStateChanged.current(newState);
  }, []);

  useEffect(() => {
   
    if (neuroglancerStateRef.current && neuroglancerStateRef.current.layers) {
      console.log("updateState")
      const updatedNeuroglancerState = {
        ...neuroglancerStateRef.current,
        layers: neuroglancerStateRef.current.layers.map((layer, index) =>
          index === 0
            ? {
                ...layer,
                segments: Object.keys(cellColorMapping).map(String),
                segmentColors: cellColorMapping,
              }
            : layer
        ),
      };
      neuroglancerStateRef.current = updatedNeuroglancerState;
      cellColorMappingUpdateRef.current = true;
      console.log("useEffect cellColorMapping",Object.keys(cellColorMapping).length,  neuroglancerStateRef.current.layers);
      // setViewerState(updatedNeuroglancerState);
    }

  }, [cellColorMapping]);

  useEffect(() => {
    if (cellColorMappingUpdateRef.current) {
      setViewerState(neuroglancerStateRef.current);
      cellColorMappingUpdateRef.current = false;
    }
  }, [ cellColorMappingUpdateRef.current ]);

  useEffect(() => {
    if (isComponentMounted.current && !initialNeuroglancerStateRef.current && viewerState) {
      initialNeuroglancerStateRef.current = cloneDeep(viewerState);
    }
  }, [viewerState]);

  return (
    <>
      <style>{globalNeuroglancerCss}</style>
      <div className={classes.neuroglancerWrapper}>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyReactNeuroglancer
            brainMapsClientId="NOT_A_VALID_ID"
            viewerState={neuroglancerStateRef.current}
            onViewerStateChanged={handleStateChanged}
            bundleRoot={bundleRoot}
            ref={viewerRef}
          />
        </Suspense>
      </div>
    </>
  );
}