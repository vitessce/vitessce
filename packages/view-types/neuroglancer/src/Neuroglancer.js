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
  console.log('N rendered');
  const classes = useStyles();
  const bundleRoot = useMemo(() => createWorker(), []);
  const viewerRef = useRef(null);
  const latestStateRef = useRef(viewerState);
  const neuroglancerStateRef = useRef(viewerState);
  const changedPropertiesRef = useRef({});
  const isInitialLoad = useRef(true);
  const initialNeuroglancerStateRef = useRef(null);
  const isComponentMounted = useRef(false);
  const cellColorMappingUpdateRef = useRef(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

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
    console.log('changed', changedProps);

    if (!isEqual(newState, latestStateRef.current)) {
      latestStateRef.current = newState;
    }

    neuroglancerStateRef.current = newState;

    // if (!isEqual(neuroglancerStateRef.current, newState)) {
    //   neuroglancerStateRef.current = newState;
    // }
  }, 100));

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

    if (initialNeuroglancerStateRef.current && isEqual(newState, initialNeuroglancerStateRef.current)) {
      return;
    }
    throttledHandleStateChanged.current(newState);
  }, []);

  useEffect(() => {
    if (neuroglancerStateRef.current && neuroglancerStateRef.current.layers) {
      console.log('updateState');
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
      // neuroglancerStateRef.current = updatedNeuroglancerState;
     
    
      const tempNeuroglancerState = updatedNeuroglancerState;
   
      neuroglancerStateRef.current = tempNeuroglancerState; 
      cellColorMappingUpdateRef.current = true;
      console.log('useEffect cellColorMapping', Object.keys(cellColorMapping).length, neuroglancerStateRef.current.layers[0].segments.length);
      // setUpdateTrigger((prev) => prev + 1); // Trigger re-render
      setViewerState(tempNeuroglancerState)
    }
  }, [cellColorMapping]);

  useEffect(() => {
    if (cellColorMappingUpdateRef.current) {
      console.log("checking state", viewerState.layers, neuroglancerStateRef.current.layers[0].segments?.length)
      setViewerState(neuroglancerStateRef.current);
      cellColorMappingUpdateRef.current = false;
    }
  }, [cellColorMappingUpdateRef.current]);

  useEffect(() => {
    console.log("inital")
    if (isComponentMounted.current && !initialNeuroglancerStateRef.current && viewerState) {
      console.log("inital if")
      initialNeuroglancerStateRef.current = cloneDeep(viewerState);
    }
  }, [viewerState]);

  // useEffect(() => {
  //   console.log("useEffect updateTrigger", updateTrigger, neuroglancerStateRef.current.layers[0].segments?.length); // Log when this effect runs
  // }, [updateTrigger]); // Depend on updateTrigger

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
