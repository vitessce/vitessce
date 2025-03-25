import React, { useCallback, useMemo, Suspense, useRef, useEffect } from 'react';
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

export function Neuroglancer(
  { cellColorMapping, onSegmentClick, onSelectHoveredCoords },
) {
  const viewerState = useNeuroglancerViewerState();
  const setViewerState = useSetNeuroglancerViewerState();
  const classes = useStyles();
  const bundleRoot = useMemo(() => createWorker(), []);
  const viewerRef = useRef(null);
  const neuroglancerStateRef = useRef(viewerState);
  const changedPropertiesRef = useRef({});
  const isInitialLoad = useRef(true);
  const stateVersionRef = useRef(0);

  const throttledHandleStateChanged = useRef(throttle((newState) => {
    const differences = cloneDeep(newState);
    const changedProps = {};

    forEach(differences, (value, key) => {
      const previousValue = get(neuroglancerStateRef.current, key);
      if (!isEqual(value, previousValue)) {
        changedProps[key] = value;
      }
    });
    changedPropertiesRef.current = changedProps;
    if (!isEqual(neuroglancerStateRef.current, newState)) {
      stateVersionRef.current += 1;
      neuroglancerStateRef.current = newState;
    }
  }, 300));

  useEffect(() => {
    if (!neuroglancerStateRef.current) return;

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
  }, [cellColorMapping, stateVersionRef.current]);

  const handleStateChanged = useCallback((newState) => {
    // Ignoring the many state changes during the initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    // To avoid updating state with corrupted dimensions
    if (newState && newState.dimensions === undefined) {
      // console.warn('Filtered out state update with dimensions: undefined');
      return;
    }
    throttledHandleStateChanged.current(newState);
  }, []);

  // Note: To capture click event use control/cmd + click
  useEffect(() => {
    if (!viewerRef.current) return;
    const { viewer } = viewerRef.current;
    viewer.element.addEventListener('mousedown', (event) => {
      if (event.button === 0) {
        setTimeout(() => {
          const { pickedValue } = viewer.mouseState;
          if (pickedValue && pickedValue?.low) {
            onSegmentClick(pickedValue?.low);
          }
        }, 100);
      }
    });


    function addHover() {
      // const width = viewer.element.offsetWidth;
      // const height = viewer.element.offsetHeight;

      if (viewer.mouseState.pickedValue !== undefined) {
        const pickedSegment = viewer.mouseState.pickedValue;
        // const pickedCoords = viewer.mouseState.position;
        // const hoverData = {
        //   x: pickedCoords[0],
        //   y: pickedCoords[1],
        //   z: pickedCoords[2],
        //   hoveredId: pickedSegment?.low,
        //   width,
        //   height,
        // };
        onSelectHoveredCoords(pickedSegment?.low);
      }
    }

    viewer.mouseState.changed.add(addHover);
  }, [viewerRef.current]);

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
