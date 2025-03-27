import React, { useCallback, useMemo, Suspense, useRef, useEffect } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';

import { cloneDeep, get, isEqual, forEach, throttle, debounce, pick } from 'lodash-es';
import { useStyles, globalNeuroglancerCss } from './styles.js';


const LazyReactNeuroglancer = React.lazy(async () => {
  const ReactNeuroglancer = await import('@janelia-flyem/react-neuroglancer');
  return ReactNeuroglancer;
});

function createWorker() {
  return new ChunkWorker();
}

function isValidState(viewerState) {
  const { projectionScale, projectionOrientation, position, dimensions } = viewerState || {};
  return (dimensions !== undefined && typeof projectionScale === 'number' && Array.isArray(projectionOrientation) && projectionOrientation.length === 3 && Array.isArray(position) && position.length === 2);
}

function compareViewerState(prevState, nextState) {
  if(isValidState(prevState) === isValidState(nextState)) {
    const prevSubset = pick(prevState, ['projectionScale', 'projectionOrientation', 'position', 'dimensions']);
    const nextSubset = pick(nextState, ['projectionScale', 'projectionOrientation', 'position', 'dimensions']);
    return isEqual(prevSubset, nextSubset);
  }
  return false;
}

export function Neuroglancer(props) {
  const {
    cellColorMapping,
    onSegmentClick,
    onSelectHoveredCoords,
    viewerState,
    setViewerState
  } = props;
  const classes = useStyles();
  const bundleRoot = useMemo(() => createWorker(), []);
  const viewerRef = useRef(null);

  /*
  const neuroglancerStateRef = useRef(viewerState);
  const changedPropertiesRef = useRef({});
  const isInitialLoad = useRef(true);
  const stateVersionRef = useRef(0);

  // Debounced function to delay updates and prevent excessive parent re-renders
  const batchedUpdate = debounce((newState) => {
    setViewerState(newState);
  }, 500);

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
    // console.log(changedProps);
    if (!isEqual(neuroglancerStateRef.current, newState)) {
      stateVersionRef.current += 1;
      neuroglancerStateRef.current = newState;
      requestAnimationFrame(() => {
        batchedUpdate(newState);
      });
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
  */

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
      if (viewer.mouseState.pickedValue !== undefined) {
        const pickedSegment = viewer.mouseState.pickedValue;
        onSelectHoveredCoords(pickedSegment?.low);
      }
    }

    viewer.mouseState.changed.add(addHover);
  }, [viewerRef.current]);

  const neuroglancerComponent = useMemo(() => {

    const onViewerStateChanged = (nextViewerState) => {
      // TODO: compare next to previous
      if(!compareViewerState(viewerState, nextViewerState)) {
        setViewerState(nextViewerState);
      }
    };

    // TODO: define a setViewerState here
    console.log(viewerState);
    return viewerState ? (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyReactNeuroglancer
          brainMapsClientId="NOT_A_VALID_ID"
          viewerState={viewerState}
          onViewerStateChanged={onViewerStateChanged}
          bundleRoot={bundleRoot}
          ref={viewerRef}
        />
      </Suspense>
    ) : null;
  }, [viewerState, setViewerState, bundleRoot, viewerRef]);

  return (
    <>
      <style>{globalNeuroglancerCss}</style>
      <div className={classes.neuroglancerWrapper}>
        {neuroglancerComponent}
      </div>
    </>
  );
}
