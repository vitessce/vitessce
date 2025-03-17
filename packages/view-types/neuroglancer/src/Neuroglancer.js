import React, { useCallback, useMemo, Suspense, useRef, useEffect, useState } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';
import { useStyles, globalNeuroglancerCss } from './styles.js';

const LazyReactNeuroglancer = React.lazy(async () => {
  const ReactNeuroglancer = await import('@janelia-flyem/react-neuroglancer');
  return ReactNeuroglancer;
});

function createWorker() {
  return new ChunkWorker();
}

export function Neuroglancer(props) {
  const {
    viewerState: initialViewerState,
    onViewerStateChanged,
    cellColorMapping,
  } = props;
  
  const classes = useStyles();
  const bundleRoot = useMemo(() => createWorker(), []);
  const viewerRef = useRef(null);
  const latestStateRef = useRef(initialViewerState);
  const [updatedState, setUpdatedState] = useState(initialViewerState);

  const handleStateChanged = useCallback((newState) => {
    console.log("change")
    if (JSON.stringify(newState) !== JSON.stringify(latestStateRef.current)) {
      latestStateRef.current = newState;
      onViewerStateChanged?.(newState);
    
    }
  }, [onViewerStateChanged]);

  useEffect(() => {
    setUpdatedState(prevState => {
      if (!prevState || !prevState.layers?.length) return prevState;

      const newLayers = prevState.layers.map((layer, index) => 
        index === 0
          ? {
              ...layer,
              segments: Object.keys(cellColorMapping),
              segmentColors: cellColorMapping,
            }
          : layer
      );

      return JSON.stringify(newLayers) === JSON.stringify(prevState.layers)
        ? prevState
        : { ...prevState, layers: newLayers };
    });
  }, [cellColorMapping]);

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
          />
        </Suspense>
      </div>
    </>
  );
}
