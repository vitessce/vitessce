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

export function Neuroglancer({ cellColorMapping, viewerState , onViewerStateChanged}) {
  console.log("N rendered", viewerState)
  // const viewerState = useNeuroglancerViewerState();
  const setViewerState = useSetNeuroglancerViewerState();

  const classes = useStyles();
  const bundleRoot = useMemo(() => createWorker(), []);
  const viewerRef = useRef(null);
  const latestStateRef = useRef(viewerState);
  const [updatedState, setUpdatedState] = useState(viewerState);
  const changedPropertiesRef = useRef({});
  const isInitialLoad = useRef(true);
  const [isNeuroglancerLoaded, setIsNeuroglancerLoaded] = useState(false); 
  const throttledHandleStateChanged = useRef(throttle((newState) => {
    const differences = cloneDeep(newState);
    let changedProperties = {};

    forEach(differences, (value, key) => {
      const previousValue = get(latestStateRef.current, key);
      if (!isEqual(value, previousValue)) {
        changedProperties[key] = value;
      }
    });

    changedPropertiesRef.current = changedProperties;

    if (!isEqual(newState, latestStateRef.current)) {
      latestStateRef.current = newState;
      // console.log("new state", newState)
      onViewerStateChanged?.(newState);
    }
  }, 100));

  const handleStateChanged = useCallback((newState) => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    throttledHandleStateChanged.current(newState);
  }, [onViewerStateChanged]);

  useEffect(() => {
    setUpdatedState((prevState) => {
      if (!prevState || !prevState.layers?.length) return prevState;

      const updatedLayers = prevState.layers.map((layer, index) =>
        index === 0
          ? {
              ...layer,
              segments: Object.keys(cellColorMapping).map(String),
              segmentColors: cellColorMapping,
              selectedSegments: prevState.layers[index].selectedSegments || [],
            }
          : layer
      );

      const newState = {
        ...prevState,
        layers: updatedLayers,
        ...changedPropertiesRef.current,
      };
      return newState;
    });
  }, [cellColorMapping]);

  const handleNeuroglancerLoad = useCallback(() => {
    setIsNeuroglancerLoaded(true);
  }, []);

  return (
    <>
      <style>{globalNeuroglancerCss}</style>
      <div className={classes.neuroglancerWrapper}>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyReactNeuroglancer
            brainMapsClientId="NOT_A_VALID_ID"
            viewerState={updatedState}
            onViewerStateChanged={handleStateChanged}
            bundleRoot={bundleRoot}
            ref={viewerRef}
            onLoad={handleNeuroglancerLoad} 
          />
        </Suspense>
      </div>
    </>
  );
}