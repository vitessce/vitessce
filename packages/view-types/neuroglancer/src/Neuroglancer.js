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
  // console.log("Neuro")
  const {
    viewerState: initialViewerState,
    // onViewerStateChanged,
    onSegmentSelect,
  } = props;
  const classes = useStyles();
  const bundleRoot = useMemo(() => createWorker(), []);
  const viewerRef = useRef(null);
  // const [updatedState, setUpdatedState] = useState(initialViewerState);
  const getCoordinates = (viewer) => {
    const coordinates = viewer?.navigationState?.pose?.position?.coordinates_;
    return coordinates;
  };

  // useEffect(() => {
  //   if (!viewerRef.current || !viewerRef.current.viewer) return;
  //   const { viewer } = viewerRef.current;

  //   const hoveredSegmentId = () => {
  //     const selectedLayer = viewer.layerManager.getLayerByName('segmentation');
  //     if (selectedLayer) {
  //       const hoveredSegmentId = selectedLayer.layer_.displayState.segmentationGroupState.curRoot.selectionState.value;
  //       console.log('Hovered Segment', hoveredSegmentId?.low);
  //       onSegmentSelect(hoveredSegmentId?.low);
  //     }
  //   };

  //   // viewer.mouseState.changed.add(hoveredSegmentId);
  // }, [viewerRef.current]);

  return (
    <>
      <style>{globalNeuroglancerCss}</style>
      <div className={classes.neuroglancerWrapper}>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyReactNeuroglancer
            brainMapsClientId="NOT_A_VALID_ID"
            viewerState={initialViewerState}
            // onViewerStateChanged={handleSegmentChanged}
            bundleRoot={bundleRoot}
            ref={viewerRef}
          />
        </Suspense>
      </div>
    </>
  );
}
