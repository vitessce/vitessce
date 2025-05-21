import React, { useCallback, useMemo, Suspense } from 'react';
import { ChunkWorker } from '@vitessce/neuroglancer-workers';
import { useStyles, globalNeuroglancerCss } from './styles.js';

// We lazy load the Neuroglancer component,
// because the non-dynamic import causes problems for Vitest,
// as the package appears contain be a mix of CommonJS and ESM syntax.
const LazyReactNeuroglancer = React.lazy(async () => {
  const ReactNeuroglancer = await import('@janelia-flyem/react-neuroglancer');
  return ReactNeuroglancer;
});

// Reference: https://github.com/developit/jsdom-worker/issues/14#issuecomment-1268070123
function createWorker() {
  return new ChunkWorker();
}

export function Neuroglancer(props) {
  const {
    viewerState,
    onViewerStateChanged,
  } = props;
  const { classes } = useStyles();
  const bundleRoot = useMemo(() => createWorker(), []);

  const handleStateChanged = useCallback((newState) => {
    if (JSON.stringify(newState) !== JSON.stringify(viewerState)) {
      if (onViewerStateChanged) {
        onViewerStateChanged(newState);
      }
    }
  }, [onViewerStateChanged, viewerState]);

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
          />
        </Suspense>
      </div>
    </>
  );
}
